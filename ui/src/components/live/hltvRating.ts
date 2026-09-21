/** HLTV Rating 2.0 / 3.0 — mirrors backend HltvRating.cs */

export function effectiveRounds(kills: number, deaths: number, matchRound: number): number {
  return Math.max(Math.max(matchRound, kills + deaths), 3);
}

const AVG_KPR = 0.679;
const AVG_DPR = 0.679;
const AVG_APR = 0.184;
const AVG_ADR = 80.2;

export function hltvRating2(
  kills: number, deaths: number, assists: number, rounds: number,
  mvps = 0, score = 0, adr?: number,
): number {
  const r = effectiveRounds(kills, deaths, rounds);
  const kpr = kills / r;
  const dpr = deaths / r;
  const apr = assists / r;

  const kastRounds = Math.min(r, kills + assists + Math.max(0, r - deaths));
  const kast = Math.min(100, (kastRounds / r) * 100);

  let impact = 2.13 * kpr + 0.42 * apr - 0.41;
  if (mvps > 0) impact += (mvps / r) * 1.2;

  const adrVal = adr ?? (score > 0 ? Math.min(160, Math.max(25, (score / r) * 2.85)) : AVG_ADR);

  const rating = 0.0073 * kast + 0.3591 * kpr - 0.5329 * dpr + 0.2372 * impact + 0.0032 * adrVal + 0.1587;
  return Math.round(Math.max(0.01, Math.min(3.5, rating)) * 100) / 100;
}

export function hltvRating3(
  kills: number, deaths: number, assists: number, rounds: number,
  mvps = 0, score = 0, adr?: number,
): number {
  const r = effectiveRounds(kills, deaths, rounds);
  const kpr = kills / r;
  const apr = assists / r;

  const killRating = kpr / AVG_KPR;
  const survRating = Math.max(0.01, (r - deaths) / r) / (1.0 - AVG_DPR + 0.01);
  const assistRating = apr / AVG_APR;

  const adrVal = adr ?? (score > 0 ? (score / r) * 2.85 : AVG_ADR);
  const dmgRating = adrVal / AVG_ADR;

  let r3 = killRating * 0.40 + survRating * 0.20 + assistRating * 0.10 + dmgRating * 0.25;
  if (mvps > 0) r3 += (mvps / r) * 0.15;

  const r2 = hltvRating2(kills, deaths, assists, rounds, mvps, score, adr);
  return Math.round(Math.max(0.01, Math.min(3.5, r3 * 0.55 + r2 * 0.45)) * 100) / 100;
}

export function ratingColor(r: number): string {
  if (r >= 1.25) return '#22c55e';
  if (r >= 1.05) return '#86efac';
  if (r >= 0.85) return '#e2e8f0';
  return '#f87171';
}

export function ratingLabel(r: number): string {
  if (r >= 1.30) return '1.30+';
  if (r >= 1.10) return '1.10+';
  if (r >= 1.00) return '1.00';
  if (r >= 0.85) return '0.85';
  return '<0.85';
}
