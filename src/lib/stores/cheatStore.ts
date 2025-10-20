import { writable } from 'svelte/store';

export interface Cheat {
  id: number;
  name: string;
  image: string;
  status: 'Undetected' | 'Detected' | 'Maintenance' | 'Updating' | 'Expired';
  licensed: boolean;
}

const initialCheats: Cheat[] = [
  {
    id: 1,
    name: 'Valorant Aimbot',
    image: '/Valorant.webp',
    status: 'Undetected',
    licensed: true,
  },
  {
    id: 2,
    name: 'CS2 Wallhack',
    image: '/CS2.webp',
    status: 'Detected',
    licensed: false,
  },
  {
    id: 3,
    name: 'Fortnite ESP',
    image: '/Fortnite.webp',
    status: 'Maintenance',
    licensed: true,
  },
  {
    id: 4,
    name: 'Apex Legends No Recoil',
    image: '/ApexLegends.webp',
    status: 'Updating',
    licensed: false,
  },
  {
    id: 5,
    name: 'Warzone Unlock All',
    image: '/Warzone2.webp',
    status: 'Expired',
    licensed: true,
  },
];

export const cheats = writable<Cheat[]>(initialCheats);
