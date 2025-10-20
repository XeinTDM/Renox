import { writable } from 'svelte/store';
import type { UserRole } from '$lib/types/permissions';

export interface SystemUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  licenses: string[];
}

export interface License {
  id: string;
  key: string;
  type: 'trial' | 'basic' | 'premium' | 'lifetime';
  userId?: string;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  features: string[];
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalLicenses: number;
  activeLicenses: number;
  revenue: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  cheats: {
    total: number;
    active: number;
    detected: number;
  };
}

export interface ManagementSettings {
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  maxLicensesPerUser: number;
  trialDuration: number; // in days
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

// Mock data for development
const mockUsers: SystemUser[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@rubi.loader',
    role: 'admin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-15T10:30:00Z',
    licenses: ['ADMIN-LICENSE'],
  },
  {
    id: '2',
    username: 'developer1',
    email: 'dev1@rubi.loader',
    role: 'developer',
    isActive: true,
    createdAt: '2024-01-02T00:00:00Z',
    lastLogin: '2024-01-14T15:20:00Z',
    licenses: ['DEV-LICENSE-1', 'DEV-LICENSE-2'],
  },
  {
    id: '3',
    username: 'reseller1',
    email: 'reseller1@rubi.loader',
    role: 'reseller',
    isActive: true,
    createdAt: '2024-01-03T00:00:00Z',
    lastLogin: '2024-01-13T09:15:00Z',
    licenses: ['RESELLER-LICENSE'],
  },
];

const mockLicenses: License[] = [
  {
    id: '1',
    key: 'ADMIN-LICENSE',
    type: 'lifetime',
    userId: '1',
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true,
    features: ['all'],
  },
  {
    id: '2',
    key: 'DEV-LICENSE-1',
    type: 'premium',
    userId: '2',
    createdBy: 'admin',
    createdAt: '2024-01-02T00:00:00Z',
    expiresAt: '2024-12-31T23:59:59Z',
    isActive: true,
    features: ['cheat:create', 'cheat:manage', 'license:manage'],
  },
  {
    id: '3',
    key: 'RESELLER-LICENSE',
    type: 'premium',
    userId: '3',
    createdBy: 'admin',
    createdAt: '2024-01-03T00:00:00Z',
    expiresAt: '2024-06-30T23:59:59Z',
    isActive: true,
    features: ['cheat:manage', 'license:manage', 'user:view'],
  },
];

const mockStats: SystemStats = {
  totalUsers: 1234,
  activeUsers: 856,
  totalLicenses: 2345,
  activeLicenses: 1890,
  revenue: {
    daily: 450,
    weekly: 3150,
    monthly: 12450,
  },
  cheats: {
    total: 8,
    active: 6,
    detected: 1,
  },
};

const mockSettings: ManagementSettings = {
  allowRegistration: true,
  requireEmailVerification: false,
  maxLicensesPerUser: 5,
  trialDuration: 7,
  maintenanceMode: false,
  maintenanceMessage: 'System is under maintenance. Please try again later.',
};

// Create stores
export const systemUsers = writable<SystemUser[]>(mockUsers);
export const licenses = writable<License[]>(mockLicenses);
export const systemStats = writable<SystemStats>(mockStats);
export const managementSettings = writable<ManagementSettings>(mockSettings);

// Store actions
export const managementActions = {
  // User management
  addUser: (user: Omit<SystemUser, 'id' | 'createdAt'>) => {
    const newUser: SystemUser = {
      ...user,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    systemUsers.update((users) => [...users, newUser]);
  },

  updateUser: (id: string, updates: Partial<SystemUser>) => {
    systemUsers.update((users) =>
      users.map((user) => (user.id === id ? { ...user, ...updates } : user)),
    );
  },

  deleteUser: (id: string) => {
    systemUsers.update((users) => users.filter((user) => user.id !== id));
  },

  // License management
  addLicense: (license: Omit<License, 'id' | 'createdAt'>) => {
    const newLicense: License = {
      ...license,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    licenses.update((licenses) => [...licenses, newLicense]);
  },

  updateLicense: (id: string, updates: Partial<License>) => {
    licenses.update((licenses) =>
      licenses.map((license) => (license.id === id ? { ...license, ...updates } : license)),
    );
  },

  deleteLicense: (id: string) => {
    licenses.update((licenses) => licenses.filter((license) => license.id !== id));
  },

  // Settings management
  updateSettings: (updates: Partial<ManagementSettings>) => {
    managementSettings.update((settings) => ({ ...settings, ...updates }));
  },

  // Stats management
  updateStats: (updates: Partial<SystemStats>) => {
    systemStats.update((stats) => ({ ...stats, ...updates }));
  },
};
