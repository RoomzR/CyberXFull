export const TARIFF_ZONES = ['standard', 'stage', 'bootcamp', 'pss'] as const;

export type TariffZone = (typeof TARIFF_ZONES)[number];

export type TariffRate = { weekday: number; weekend: number } | number;

export interface TariffRow {
  id: string;
  rates: Record<TariffZone, TariffRate>;
}

export const TARIFF_ROWS: TariffRow[] = [
  {
    id: '1h',
    rates: {
      standard: { weekday: 6, weekend: 7 },
      stage: { weekday: 7, weekend: 8 },
      bootcamp: { weekday: 8, weekend: 9 },
      pss: 15,
    },
  },
  {
    id: '3h',
    rates: {
      standard: { weekday: 15, weekend: 18 },
      stage: { weekday: 18, weekend: 21 },
      bootcamp: { weekday: 21, weekend: 24 },
      pss: 35,
    },
  },
  {
    id: '5h',
    rates: {
      standard: { weekday: 24, weekend: 29 },
      stage: { weekday: 29, weekend: 34 },
      bootcamp: { weekday: 34, weekend: 38 },
      pss: 50,
    },
  },
  {
    id: 'fullday',
    rates: {
      standard: { weekday: 50, weekend: 55 },
      stage: { weekday: 55, weekend: 60 },
      bootcamp: { weekday: 60, weekend: 65 },
      pss: 10,
    },
  },
  {
    id: 'summer',
    rates: {
      standard: 25,
      stage: 30,
      bootcamp: 30,
      pss: 25,
    },
  },
];

export const TARIFF_TIME_SLOTS = [
  { id: 'morning', hours: '08:00–13:00' },
  { id: 'day', hours: '13:00–18:00' },
  { id: 'night', hours: '22:00–08:00' },
] as const;

export function formatTariffRate(rate: TariffRate): { weekday: number; weekend: number | null } {
  if (typeof rate === 'number') {
    return { weekday: rate, weekend: null };
  }
  return rate;
}
