import { writable } from 'svelte/store';

export const appStatus = writable<string>('All systems operational');
