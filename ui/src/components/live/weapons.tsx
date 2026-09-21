export interface WeaponInfo {
  short: string;
  label: string;
  type: 'rifle' | 'sniper' | 'pistol' | 'smg' | 'heavy' | 'grenade' | 'knife' | 'other';
}

const WEAPONS: Record<string, WeaponInfo> = {
  weapon_ak47:              { short: 'AK',   label: 'AK-47',    type: 'rifle' },
  weapon_m4a1:              { short: 'M4A4', label: 'M4A4',     type: 'rifle' },
  weapon_m4a1_silencer:     { short: 'M4A1', label: 'M4A1-S',   type: 'rifle' },
  weapon_m4a1_silencer_off: { short: 'M4A1', label: 'M4A1-S',   type: 'rifle' },
  weapon_awp:               { short: 'AWP',  label: 'AWP',      type: 'sniper' },
  weapon_ssg08:             { short: 'SSG',  label: 'SSG 08',   type: 'sniper' },
  weapon_deagle:            { short: 'DE',   label: 'Deagle',   type: 'pistol' },
  weapon_usp_silencer:      { short: 'USP',  label: 'USP-S',    type: 'pistol' },
  weapon_glock:             { short: 'GLO',  label: 'Glock',    type: 'pistol' },
  weapon_p250:              { short: 'P250', label: 'P250',     type: 'pistol' },
  weapon_fiveseven:         { short: '57',   label: 'Five-SeveN', type: 'pistol' },
  weapon_tec9:              { short: 'T9',   label: 'Tec-9',    type: 'pistol' },
  weapon_mp9:               { short: 'MP9',  label: 'MP9',      type: 'smg' },
  weapon_mac10:             { short: 'MAC',  label: 'MAC-10',   type: 'smg' },
  weapon_ump45:             { short: 'UMP',  label: 'UMP-45',   type: 'smg' },
  weapon_p90:               { short: 'P90',  label: 'P90',      type: 'smg' },
  weapon_galilar:           { short: 'GAL',  label: 'Galil AR', type: 'rifle' },
  weapon_famas:             { short: 'FAM',  label: 'FAMAS',    type: 'rifle' },
  weapon_aug:               { short: 'AUG',  label: 'AUG',      type: 'rifle' },
  weapon_sg556:             { short: 'SG',   label: 'SG 553',   type: 'rifle' },
  weapon_nova:              { short: 'NOV',  label: 'Nova',     type: 'heavy' },
  weapon_xm1014:            { short: 'XM',   label: 'XM1014',   type: 'heavy' },
  weapon_knife:             { short: 'KN',   label: 'Knife',    type: 'knife' },
  weapon_knife_t:           { short: 'KN',   label: 'Knife',    type: 'knife' },
  weapon_c4:                { short: 'C4',   label: 'C4',       type: 'other' },
};

const TYPE_COLORS: Record<WeaponInfo['type'], string> = {
  rifle:  '#e8a838',
  sniper: '#ef4444',
  pistol: '#94a3b8',
  smg:    '#a3e635',
  heavy:  '#c084fc',
  grenade:'#64748b',
  knife:  '#475569',
  other:  '#475569',
};

export function getWeapon(id?: string): WeaponInfo {
  if (!id) return { short: '—', label: '—', type: 'other' };
  const key = id.toLowerCase();
  return WEAPONS[key] ?? {
    short: id.replace(/^weapon_/, '').slice(0, 4).toUpperCase(),
    label: id.replace(/^weapon_/, '').replace(/_/g, ' ').toUpperCase(),
    type: 'other',
  };
}

export function weaponColor(type: WeaponInfo['type']) {
  return TYPE_COLORS[type];
}

export function WeaponBadge({ weapon, dead }: { weapon?: string; dead?: boolean }) {
  const w = getWeapon(weapon);
  if (!weapon || dead) {
    return (
      <span className="wpn-badge wpn-badge--dead" title={dead ? 'Dead' : 'No weapon'}>
        {dead ? '✕' : '—'}
      </span>
    );
  }
  return (
    <span className={`wpn-badge wpn-badge--${w.type}`} title={w.label}>
      {w.short}
    </span>
  );
}
