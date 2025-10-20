import { writable } from 'svelte/store';

export const isLocked = writable<boolean>(false);

// Holds the active session PIN in memory only until unlocked session ends (never persisted)
export const hasPinSet = writable<boolean>(false);
