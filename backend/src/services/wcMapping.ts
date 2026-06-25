/**
 * Maps football-data.org v4 shapes onto our domain model (confederation enum, stage enum,
 * group letters, match status, recent form, positions, 3-letter codes). Kept pure and
 * dependency-free so it's easy to unit-test and reuse from both the import script and live sync.
 */
export type Confederation = 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC';
export type Stage = 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'third' | 'final';
export type MatchStatus = 'scheduled' | 'live' | 'finished';

/** Country → confederation for World Cup nations (best-effort; defaults to UEFA). */
const CONFEDERATION_BY_COUNTRY: Record<string, Confederation> = {
  // CONMEBOL
  Argentina: 'CONMEBOL', Brazil: 'CONMEBOL', Uruguay: 'CONMEBOL', Colombia: 'CONMEBOL',
  Ecuador: 'CONMEBOL', Paraguay: 'CONMEBOL', Peru: 'CONMEBOL', Chile: 'CONMEBOL',
  Bolivia: 'CONMEBOL', Venezuela: 'CONMEBOL',
  // CONCACAF
  USA: 'CONCACAF', 'United-States': 'CONCACAF', 'United States': 'CONCACAF', Canada: 'CONCACAF',
  Mexico: 'CONCACAF', 'Costa-Rica': 'CONCACAF', 'Costa Rica': 'CONCACAF', Panama: 'CONCACAF',
  Honduras: 'CONCACAF', Jamaica: 'CONCACAF', 'El-Salvador': 'CONCACAF', 'Trinidad-And-Tobago': 'CONCACAF',
  Curacao: 'CONCACAF', Haiti: 'CONCACAF',
  // CAF
  Morocco: 'CAF', Senegal: 'CAF', Tunisia: 'CAF', Algeria: 'CAF', Egypt: 'CAF', Nigeria: 'CAF',
  Ghana: 'CAF', Cameroon: 'CAF', 'Ivory-Coast': 'CAF', 'Cote-d-Ivoire': 'CAF', Mali: 'CAF',
  'South-Africa': 'CAF', 'Cape-Verde': 'CAF', Angola: 'CAF', 'DR-Congo': 'CAF', 'Congo-DR': 'CAF',
  // AFC
  Japan: 'AFC', 'South-Korea': 'AFC', 'Korea-Republic': 'AFC', 'Korea Republic': 'AFC', Iran: 'AFC',
  Australia: 'AFC', 'Saudi-Arabia': 'AFC', 'Saudi Arabia': 'AFC', Qatar: 'AFC', Iraq: 'AFC',
  Uzbekistan: 'AFC', Jordan: 'AFC',
  // OFC
  'New-Zealand': 'OFC', 'New Zealand': 'OFC',
  // UEFA (sample — default catches the rest)
  France: 'UEFA', England: 'UEFA', Spain: 'UEFA', Germany: 'UEFA', Portugal: 'UEFA', Netherlands: 'UEFA',
  Italy: 'UEFA', Belgium: 'UEFA', Croatia: 'UEFA', Denmark: 'UEFA', Switzerland: 'UEFA', Austria: 'UEFA',
  Poland: 'UEFA', Serbia: 'UEFA', Ukraine: 'UEFA', Scotland: 'UEFA', Turkey: 'UEFA', Norway: 'UEFA',
  Sweden: 'UEFA', Wales: 'UEFA',
};

export function confederationOf(country: string): Confederation {
  return CONFEDERATION_BY_COUNTRY[country] ?? CONFEDERATION_BY_COUNTRY[country?.replace(/\s+/g, '-')] ?? 'UEFA';
}

/** football-data.org `stage` enum → our stage. */
export function mapFdStage(stage: string): Stage {
  switch (stage) {
    case 'LAST_32': return 'r32';
    case 'LAST_16': return 'r16';
    case 'QUARTER_FINALS': return 'qf';
    case 'SEMI_FINALS': return 'sf';
    case 'THIRD_PLACE': return 'third';
    case 'FINAL': return 'final';
    case 'GROUP_STAGE':
    default: return 'group';
  }
}

/** football-data.org `status` enum → our match status. */
const FD_LIVE = new Set(['IN_PLAY', 'PAUSED', 'LIVE']);
const FD_FINISHED = new Set(['FINISHED', 'AWARDED']);
export function mapFdStatus(status: string): MatchStatus {
  if (FD_FINISHED.has(status)) return 'finished';
  if (FD_LIVE.has(status)) return 'live';
  return 'scheduled';
}

/** 'GROUP_A' → 'A' (null/non-group → undefined). */
export function groupLetter(group: string | null | undefined): string | undefined {
  const m = (group ?? '').match(/GROUP[_\s]?([A-L])/i);
  return m ? m[1].toUpperCase() : undefined;
}

/** 'W,D,L,W,W' → ['W','D','L','W','W'] (empty array when absent). */
export function parseForm(form: string | null | undefined): string[] {
  if (!form) return [];
  return form.split(',').map((s) => s.trim().toUpperCase()).filter((s) => s === 'W' || s === 'D' || s === 'L');
}

/** football-data.org player position → our position enum. */
export function mapPosition(position: string | null | undefined): 'GK' | 'DF' | 'MF' | 'FW' {
  switch ((position ?? '').toLowerCase()) {
    case 'goalkeeper': return 'GK';
    case 'defence':
    case 'defender': return 'DF';
    case 'midfield':
    case 'midfielder': return 'MF';
    case 'offence':
    case 'attacker':
    case 'forward': return 'FW';
    default: return 'MF';
  }
}

/**
 * Derive a unique 3-letter uppercase team code. Prefers football-data.org's `tla`, else the
 * first letters of the name; `used` tracks collisions so codes stay unique within an import.
 */
export function uniqueCode(name: string, code: string | null, used: Set<string>): string {
  const base = (code && /^[A-Za-z]{3}$/.test(code) ? code : name.replace(/[^A-Za-z]/g, '').slice(0, 3))
    .toUpperCase()
    .padEnd(3, 'X');
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  // Collision: walk the third character until free.
  for (let c = 65; c <= 90; c++) {
    const candidate = base.slice(0, 2) + String.fromCharCode(c);
    if (!used.has(candidate)) {
      used.add(candidate);
      return candidate;
    }
  }
  used.add(base);
  return base; // give up gracefully (extremely unlikely with 48 teams)
}
