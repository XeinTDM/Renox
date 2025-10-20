import { writable } from 'svelte/store';

export const latestVersion = writable<string>('');
