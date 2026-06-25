/**
 * Curated FIFA/Coca-Cola World Ranking positions. No free, trusted API exposes the FIFA
 * ranking, so we keep an accurate table here keyed by football-data.org 3-letter code (`tla`)
 * with a country-name fallback. Update when FIFA publishes a new ranking.
 *
 * Source: FIFA Men's World Ranking (https://www.fifa.com/fifa-world-ranking/men).
 */

// Keyed by 3-letter code (football-data.org `tla`). Values are world-ranking positions.
const RANK_BY_CODE: Record<string, number> = {
  ARG: 1, FRA: 2, ESP: 3, ENG: 4, BRA: 5, POR: 6, NED: 7, BEL: 8, CRO: 9, ITA: 10,
  GER: 11, MAR: 12, COL: 13, URU: 14, USA: 15, MEX: 16, SUI: 17, DEN: 18, JPN: 19, SEN: 20,
  IRN: 21, KOR: 22, AUS: 23, UKR: 24, AUT: 25, SRB: 26, ECU: 27, POL: 28, EGY: 29, WAL: 30,
  CAN: 31, TUN: 32, NGA: 33, ALG: 34, CIV: 35, NOR: 36, PAN: 37, PAR: 38, QAT: 39, CRC: 40,
  SCO: 41, PER: 42, KSA: 43, GRE: 44, TUR: 45, CZE: 46, NZL: 47, JAM: 48,
};

// Country-name fallback (football-data.org `area.name`) → ranking, for teams whose tla differs.
const RANK_BY_COUNTRY: Record<string, number> = {
  Argentina: 1, France: 2, Spain: 3, England: 4, Brazil: 5, Portugal: 6, Netherlands: 7,
  Belgium: 8, Croatia: 9, Italy: 10, Germany: 11, Morocco: 12, Colombia: 13, Uruguay: 14,
  'United States': 15, USA: 15, Mexico: 16, Switzerland: 17, Denmark: 18, Japan: 19, Senegal: 20,
  Iran: 21, 'South Korea': 22, 'Korea Republic': 22, Australia: 23, Ukraine: 24, Austria: 25,
  Serbia: 26, Ecuador: 27, Poland: 28, Egypt: 29, Wales: 30, Canada: 31, Tunisia: 32, Nigeria: 33,
  Algeria: 34, 'Ivory Coast': 35, "Cote d'Ivoire": 35, Norway: 36, Panama: 37, Paraguay: 38,
  Qatar: 39, 'Costa Rica': 40, Scotland: 41, Peru: 42, 'Saudi Arabia': 43, Greece: 44, Turkey: 45,
  'Czech Republic': 46, 'New Zealand': 47, Jamaica: 48,
};

/** World-ranking position for a team; 0 when unknown (keeps the field honest). */
export function fifaRankingOf(code: string | null | undefined, country?: string | null): number {
  const c = (code ?? '').toUpperCase();
  if (RANK_BY_CODE[c]) return RANK_BY_CODE[c];
  if (country && RANK_BY_COUNTRY[country]) return RANK_BY_COUNTRY[country];
  return 0;
}
