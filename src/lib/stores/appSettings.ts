import { writable } from 'svelte/store';

interface AppSettings {
  launchOnStartup: boolean;
  minimizeToTray: boolean;
  autoUpdateCheats: boolean;
  notifications: {
    generalSounds: boolean;
    appUpdates: boolean;
    cheatUpdates: boolean;
    errors: boolean;
  };
  hardwareAcceleration: boolean;
  developerMode: boolean;
  accentColor: 'red' | 'blue' | 'violet' | 'emerald' | 'amber' | 'pink' | 'slate';
  density: 'compact' | 'cozy';
  autoLockMinutes: number | null;
  fontScale: 0.875 | 1 | 1.125 | 1.25;
  verboseLogs: boolean;
  brand: {
    appName: string;
    logoUrl: string;
    websiteUrl: string;
    supportUrl: string;
  };
  locale: string;
  pinEnabled: boolean;
  encryptedLocalData?: string | null;
  lockOnMinimize: boolean;
  scanOnStartup?: boolean;
  consent?: {
    analytics: boolean;
    crashReports: boolean;
    marketing: boolean;
    acceptedAt: string | null;
  };
}

const defaultSettings: AppSettings = {
  launchOnStartup: false,
  minimizeToTray: false,
  autoUpdateCheats: true,
  notifications: {
    generalSounds: true,
    appUpdates: true,
    cheatUpdates: true,
    errors: true,
  },
  hardwareAcceleration: true,
  developerMode: false,
  accentColor: 'red',
  density: 'cozy',
  autoLockMinutes: null,
  fontScale: 1,
  verboseLogs: false,
  brand: {
    appName: 'Rubi Loader',
    logoUrl: '/favicon.svg',
    websiteUrl: 'https://example.com',
    supportUrl: 'https://example.com/support',
  },
  locale: 'en',
  pinEnabled: false,
  encryptedLocalData: null,
  lockOnMinimize: false,
  scanOnStartup: true,
  consent: {
    analytics: false,
    crashReports: true,
    marketing: false,
    acceptedAt: null,
  },
};

function readStoredSettings(): Partial<AppSettings> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('appSettings');
    if (!raw) return {};
    return JSON.parse(raw) as Partial<AppSettings>;
  } catch (error) {
    console.warn('Failed to parse appSettings from localStorage, resetting to defaults', error);
    localStorage.removeItem('appSettings');
    return {};
  }
}

const stored = readStoredSettings();
const merged: AppSettings = {
  ...defaultSettings,
  ...stored,
  brand: {
    ...defaultSettings.brand,
    ...(stored.brand ?? {}),
    appName: 'Rubi Loader', // Ensure appName is always 'Rubi Loader'
  },
};

export const appSettings = writable<AppSettings>(merged);

if (typeof window !== 'undefined') {
  appSettings.subscribe((value) => {
    localStorage.setItem('appSettings', JSON.stringify(value));
  });
}
