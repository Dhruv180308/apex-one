export interface DeliverySlot {
  id: string;
  label: string;
  window: string;
  remaining: number;
  premium?: boolean;
}

export const DELIVERY_SLOTS: DeliverySlot[] = [
  {
    id: 'Q3-2026',
    label: 'Allocation 01',
    window: 'Jul – Sep 2026',
    remaining: 2,
    premium: true,
  },
  {
    id: 'Q4-2026',
    label: 'Allocation 02',
    window: 'Oct – Dec 2026',
    remaining: 3,
  },
  {
    id: 'Q1-2027',
    label: 'Allocation 03',
    window: 'Jan – Mar 2027',
    remaining: 1,
    premium: true,
  },
];

export const RESERVE_DEPOSIT = '€150,000';
export const RESERVE_TOTAL_FROM = '€2,800,000';