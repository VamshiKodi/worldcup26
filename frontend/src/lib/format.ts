import type { Stage } from './types';

export const STAGE_LABEL: Record<Stage, string> = {
  group: 'Group Stage',
  r32: 'Round of 32',
  r16: 'Round of 16',
  qf: 'Quarter-final',
  sf: 'Semi-final',
  third: 'Third place',
  final: 'Final',
};

export const CONFEDERATIONS = ['UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC', 'OFC'] as const;
export const POSITIONS = ['GK', 'DF', 'MF', 'FW'] as const;

export const POSITION_LABEL: Record<string, string> = {
  GK: 'Goalkeeper',
  DF: 'Defender',
  MF: 'Midfielder',
  FW: 'Forward',
};

/** "Sat 13 Jun · 18:00" */
export function formatKickoff(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  });
}

/** Day grouping key, e.g. "Saturday, 13 June 2026". */
export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

/**
 * Live match clock derived from kickoff — the data feed sends no minute. Models a 15-minute
 * half-time so the second half reads 46'–90'. Returns 'HT' during the break and "90+'" after.
 */
export function liveMinuteLabel(kickoffIso: string): string {
  const elapsed = Math.floor((Date.now() - new Date(kickoffIso).getTime()) / 60000);
  if (elapsed <= 0) return "1'";
  if (elapsed <= 45) return `${elapsed}'`;
  if (elapsed < 60) return 'HT';
  if (elapsed <= 105) return `${elapsed - 15}'`;
  return "90+'";
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  
  const timeStr = d.toLocaleTimeString('en-IN', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });
  
  return isToday ? `Today ${timeStr}` : timeStr;
}
