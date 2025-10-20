import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { appSettings } from '$lib/stores/appSettings';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  title?: string;
  durationMs: number;
}

function playNotificationSoundSafely(
  type: 'generalSounds' | 'appUpdates' | 'cheatUpdates' | 'errors',
) {
  if (!browser) return;
  try {
    const settings = get(appSettings);
    if (!settings.notifications[type]) return;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.05, audioCtx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2);
  } catch {
    // ignore sound errors
  }
}

const { subscribe, update } = writable<Toast[]>([]);

let nextId = 1;

export const toasts = { subscribe };

export function showToast(params: {
  type?: ToastType;
  message: string;
  title?: string;
  durationMs?: number;
  playSound?: boolean;
  notificationType?: 'generalSounds' | 'appUpdates' | 'cheatUpdates' | 'errors';
}): number {
  const id = nextId++;
  const toast: Toast = {
    id,
    type: params.type ?? 'info',
    message: params.message,
    title: params.title,
    durationMs: params.durationMs ?? 3000,
  };

  update((list) => [toast, ...list]);

  if (params.playSound !== false) {
    playNotificationSoundSafely(params.notificationType || 'generalSounds');
  }

  if (toast.durationMs > 0) {
    setTimeout(() => dismissToast(id), toast.durationMs);
  }

  return id;
}

export function dismissToast(id: number) {
  update((list) => list.filter((t) => t.id !== id));
}
