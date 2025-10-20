// Secure storage wrapper: encrypts values with a per-device key and stores in localStorage.
// Device key storage prefers Tauri app-data file when available; falls back to localStorage.

import { encryptJson, decryptJson } from './crypto';
import { get } from 'svelte/store';
import { appSettings } from '$lib/stores/appSettings';

const SECRET_NS = 'rubi';
const SECRET_KEY_FILE = 'device.key';
const SECRET_KEY_FALLBACK = 'rubi_device_key_b64';

// Helper to detect if running in Tauri
function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

// Lazily load Tauri APIs only when running in Tauri
async function getTauriModules() {
  if (!isTauri()) return null;
  const fsModule = '@tauri-apps/api/fs';
  const pathModule = '@tauri-apps/api/path';
  const fs = await import(/* @vite-ignore */ fsModule);
  const pathMod = await import(/* @vite-ignore */ pathModule);
  return { fs, pathMod };
}

async function readDeviceKeyFromTauri(): Promise<string | null> {
  try {
    const mods = await getTauriModules();
    if (!mods) return null;
    const { fs, pathMod } = mods;
    const dir = await pathMod.appDataDir();
    const filePath = await pathMod.join(dir, SECRET_NS, SECRET_KEY_FILE);
    const exists = await fs.exists(filePath);
    if (!exists) return null;
    return await fs.readTextFile(filePath);
  } catch {
    return null;
  }
}

async function writeDeviceKeyToTauri(b64: string): Promise<void> {
  try {
    const mods = await getTauriModules();
    if (!mods) return;
    const { fs, pathMod } = mods;
    const dir = await pathMod.appDataDir();
    const folder = await pathMod.join(dir, SECRET_NS);
    const filePath = await pathMod.join(folder, SECRET_KEY_FILE);
    const exists = await fs.exists(folder);
    if (!exists) {
      await fs.createDir(folder, { recursive: true });
    }
    await fs.writeTextFile(filePath, b64);
  } catch (error) {
    console.error('Failed to write device key to Tauri app data: ', error);
    // ignore, will fall back to localStorage
  }
}

function base64ToBytes(b64: string): Uint8Array {
  const binStr = atob(b64);
  const bytes = new Uint8Array(binStr.length);
  for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

async function createAndStoreDeviceKey(): Promise<CryptoKey> {
  const raw = crypto.getRandomValues(new Uint8Array(32));
  const b64 = bytesToBase64(raw);
  await writeDeviceKeyToTauri(b64);
  localStorage.setItem(SECRET_KEY_FALLBACK, b64);
  return await crypto.subtle.importKey('raw', raw as unknown as BufferSource, 'AES-GCM', false, [
    'encrypt',
    'decrypt',
  ]);
}

async function importDeviceKey(b64: string): Promise<CryptoKey> {
  const raw = base64ToBytes(b64);
  return await crypto.subtle.importKey('raw', raw as unknown as BufferSource, 'AES-GCM', false, [
    'encrypt',
    'decrypt',
  ]);
}

let cachedKey: CryptoKey | null = null;
let keyPromise: Promise<CryptoKey> | null = null;

async function getOrCreateDeviceKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  if (keyPromise) return keyPromise;

  keyPromise = (async () => {
    const existing = (await readDeviceKeyFromTauri()) || localStorage.getItem(SECRET_KEY_FALLBACK);
    const key = existing ? await importDeviceKey(existing) : await createAndStoreDeviceKey();
    cachedKey = key;
    keyPromise = null;
    return key;
  })();

  return keyPromise;
}

export const setItem = async <T>(key: string, value: T): Promise<void> => {
  const settings = get(appSettings);
  const dataToStore = JSON.stringify(value);

  if (settings.encryptedLocalData) {
    const encryptedData = await encryptString(dataToStore);
    localStorage.setItem(key, encryptedData);
  } else {
    localStorage.setItem(key, dataToStore);
  }
};

export const getItem = async <T>(key: string): Promise<T | null> => {
  const settings = get(appSettings);
  const storedData = localStorage.getItem(key);

  if (!storedData) {
    return null;
  }

  if (settings.encryptedLocalData) {
    try {
      const decryptedData = await decryptString(storedData);
      if (decryptedData === null) {
        return null;
      }
      return JSON.parse(decryptedData) as T;
    } catch (error) {
      console.error('Failed to decrypt data, attempting to parse as plaintext:', error);
      // Fallback to parsing as plaintext if decryption fails
      try {
        return JSON.parse(storedData) as T;
      } catch (parseError) {
        console.error('Failed to parse stored data as plaintext:', parseError);
        return null;
      }
    }
  } else {
    try {
      return JSON.parse(storedData) as T;
    } catch (error) {
      console.error('Failed to parse stored data:', error);
      return null;
    }
  }
};

export function removeItem(key: string): void {
  localStorage.removeItem(key);
}

export async function encryptString(data: string): Promise<string> {
  const k = await getOrCreateDeviceKey();
  return await encryptJson(k, { v: data });
}

export async function decryptString(payload: string): Promise<string | null> {
  try {
    const k = await getOrCreateDeviceKey();
    const obj = await decryptJson<{ v: string }>(k, payload);
    return obj?.v ?? null;
  } catch {
    return null;
  }
}
