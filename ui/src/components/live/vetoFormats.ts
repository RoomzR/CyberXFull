/** CS2 map veto formats — 7-map Active Duty pool */

export type VetoFormatId = 'bo1' | 'bo2' | 'bo3' | 'bo5';

export interface VetoStepDef {
  action: 'ban' | 'pick' | 'decider';
  team: 'team1' | 'team2';
  label: string;
  mapRole?: string;
  hint?: string;
}

export interface VetoFormatDef {
  id: VetoFormatId;
  label: string;
  short: string;
  mapsPlayed: number;
  description: string;
  steps: VetoStepDef[];
  playableRoles: string[];
}

/** BO1: только баны, 7 карт → 6 банов → 1 карта остаётся */
const BO1_STEPS: VetoStepDef[] = [
  { action: 'ban', team: 'team1', label: 'Бан 1', hint: 'Team 1 убирает карту' },
  { action: 'ban', team: 'team2', label: 'Бан 2', hint: 'Team 2 убирает карту' },
  { action: 'ban', team: 'team1', label: 'Бан 3', hint: 'Team 1 убирает карту' },
  { action: 'ban', team: 'team2', label: 'Бан 4', hint: 'Team 2 убирает карту' },
  { action: 'ban', team: 'team1', label: 'Бан 5', hint: 'Team 1 убирает карту' },
  { action: 'ban', team: 'team2', label: 'Бан 6', hint: 'Последняя карта останется — играется автоматически' },
];

/** BO2 / BO3 MR3: ban ban → pick pick → ban ban → decider */
const BO3_STEPS: VetoStepDef[] = [
  { action: 'ban', team: 'team1', label: 'Бан', hint: 'Убрать карту из пула' },
  { action: 'ban', team: 'team2', label: 'Бан', hint: 'Убрать карту из пула' },
  { action: 'pick', team: 'team1', label: 'Пик · Map 1', mapRole: 'pick1', hint: 'Первая карта серии · кто стартует CT?' },
  { action: 'pick', team: 'team2', label: 'Пик · Map 2', mapRole: 'pick2', hint: 'Вторая карта · кто стартует CT?' },
  { action: 'ban', team: 'team1', label: 'Бан', hint: 'Убрать карту из пула' },
  { action: 'ban', team: 'team2', label: 'Бан', hint: 'Убрать карту из пула' },
  { action: 'decider', team: 'team1', label: 'Decider · Map 3', mapRole: 'decider', hint: 'Оставшаяся карта — решающая' },
];

const BO5_STEPS: VetoStepDef[] = [
  { action: 'ban', team: 'team1', label: 'Бан', hint: 'Убрать 2 карты из пула' },
  { action: 'ban', team: 'team2', label: 'Бан', hint: 'Убрать 2 карты из пула' },
  { action: 'pick', team: 'team1', label: 'Пик · Map 1', mapRole: 'map1', hint: 'Первая карта серии' },
  { action: 'pick', team: 'team2', label: 'Пик · Map 2', mapRole: 'map2', hint: 'Вторая карта' },
  { action: 'pick', team: 'team1', label: 'Пик · Map 3', mapRole: 'map3', hint: 'Третья карта' },
  { action: 'pick', team: 'team2', label: 'Пик · Map 4', mapRole: 'map4', hint: 'Четвёртая карта' },
  { action: 'decider', team: 'team1', label: 'Decider · Map 5', mapRole: 'map5', hint: 'Решающая карта' },
];

export const VETO_FORMATS: VetoFormatDef[] = [
  {
    id: 'bo1',
    label: 'Best of 1',
    short: 'BO1',
    mapsPlayed: 1,
    description: '6 банов → остаётся 1 карта (без пиков)',
    steps: BO1_STEPS,
    playableRoles: ['map1'],
  },
  {
    id: 'bo2',
    label: 'Best of 2',
    short: 'BO2',
    mapsPlayed: 2,
    description: 'ban ban → pick pick → ban ban → decider (2 карты)',
    steps: BO3_STEPS,
    playableRoles: ['pick1', 'decider'],
  },
  {
    id: 'bo3',
    label: 'Best of 3',
    short: 'BO3',
    mapsPlayed: 3,
    description: 'ban ban → pick pick → ban ban → decider (3 карты)',
    steps: BO3_STEPS,
    playableRoles: ['pick1', 'pick2', 'decider'],
  },
  {
    id: 'bo5',
    label: 'Best of 5',
    short: 'BO5',
    mapsPlayed: 5,
    description: '2 бана → 4 пика → decider (5 карт)',
    steps: BO5_STEPS,
    playableRoles: ['map1', 'map2', 'map3', 'map4', 'map5'],
  },
];

export function normalizeFormat(fmt: string): VetoFormatId {
  const id = fmt.toLowerCase() as VetoFormatId;
  return VETO_FORMATS.some(f => f.id === id) ? id : 'bo1';
}

export function getFormatDef(fmt: string): VetoFormatDef {
  return VETO_FORMATS.find(f => f.id === normalizeFormat(fmt)) ?? VETO_FORMATS[0];
}

export function getVetoSteps(fmt: string): VetoStepDef[] {
  return getFormatDef(fmt).steps;
}

export function getTotalSteps(fmt: string): number {
  return getVetoSteps(fmt).length;
}

export function mapRolesFromLog(
  fmt: string,
  log: { map: string }[],
  mapPool?: { mapName: string; status: string }[],
): Record<string, { role: string; label: string; order: number }> {
  const def = getFormatDef(fmt);
  const steps = def.steps;
  const result: Record<string, { role: string; label: string; order: number }> = {};
  let playOrder = 0;

  log.forEach((entry, i) => {
    const step = steps[i];
    if (!step?.mapRole) return;
    if (!def.playableRoles.includes(step.mapRole)) return;
    playOrder += 1;
    result[entry.map] = {
      role: step.mapRole,
      label: `MAP ${playOrder}`,
      order: playOrder,
    };
  });

  // BO1: оставшаяся карта после 6 банов
  if (def.id === 'bo1' && mapPool) {
    const left = mapPool.filter(m => m.status === 'available');
    if (left.length === 1) {
      result[left[0].mapName] = { role: 'map1', label: 'MAP 1', order: 1 };
    }
  }

  return result;
}

export function formatStatusLabel(status: string): string {
  switch (status) {
    case 'veto': return 'Veto';
    case 'live': return 'Live';
    case 'finished': return 'Завершено';
    default: return status;
  }
}

export function actionLabel(action: string): string {
  switch (action.toLowerCase()) {
    case 'ban': return 'BAN';
    case 'pick': return 'PICK';
    case 'decider': return 'DECIDER';
    default: return action.toUpperCase();
  }
}
