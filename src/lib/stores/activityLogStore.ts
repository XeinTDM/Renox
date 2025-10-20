import { writable } from 'svelte/store';

export interface UserActivity {
  id: number;
  type: string;
  timestamp: Date;
}

export const activityLog = writable<UserActivity[]>([]);
