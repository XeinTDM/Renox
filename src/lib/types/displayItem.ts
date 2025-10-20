export interface PriceOption {
  type: 'day' | 'week' | 'month' | 'lifetime';
  value: string;
}

export interface DisplayItem {
  id: number;
  name: string;
  image: string;
  status: string;
  licensed: boolean;
  description: string;
  prices: PriceOption[];
}
