import { writable } from 'svelte/store';

export type ErrorEntry = {
  id: string;
  timeISO: string;
  type: 'error' | 'unhandledrejection';
  message: string;
  stack?: string;
  details?: Record<string, unknown>;
};

export const errorLogs = writable<ErrorEntry[]>([]);

export function addErrorEntry(entry: ErrorEntry) {
  errorLogs.update((list) => [entry, ...list].slice(0, 200));
}

export function clearErrorLogs() {
  errorLogs.set([]);
}
