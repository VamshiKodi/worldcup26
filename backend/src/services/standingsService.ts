import { GroupModel, MatchModel } from '../models/index.js';
import type { Types } from 'mongoose';

interface Row {
  teamId: Types.ObjectId;
  played: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  gf: number;
  ga: number;
  gd: number;
  rank: number;
}

/**
 * Recomputes a group's standings from its finished matches and persists the table.
 * Tie-break: points → goal difference → goals for. (Head-to-head can be layered later.)
 */
export async function recomputeGroupStandings(groupId: string) {
  const group = await GroupModel.findById(groupId);
  if (!group) return null;

  const rows = new Map<string, Row>();
  for (const teamId of group.teamIds) {
    rows.set(String(teamId), {
      teamId: teamId as Types.ObjectId,
      played: 0,
      won: 0,
      draw: 0,
      lost: 0,
      points: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      rank: 0,
    });
  }

  const matches = await MatchModel.find({ groupId, status: 'finished' }).lean();
  for (const m of matches) {
    const home = rows.get(String(m.homeTeamId));
    const away = rows.get(String(m.awayTeamId));
    const hs = m.score?.home;
    const as = m.score?.away;
    if (!home || !away || hs == null || as == null) continue;

    home.played++;
    away.played++;
    home.gf += hs;
    home.ga += as;
    away.gf += as;
    away.ga += hs;

    if (hs > as) {
      home.won++; home.points += 3; away.lost++;
    } else if (hs < as) {
      away.won++; away.points += 3; home.lost++;
    } else {
      home.draw++; away.draw++; home.points++; away.points++;
    }
  }

  const sorted = [...rows.values()]
    .map((r) => ({ ...r, gd: r.gf - r.ga }))
    .sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  group.set(
    'standings',
    sorted.map((r) => ({
      teamId: r.teamId,
      played: r.played,
      points: r.points,
      gf: r.gf,
      ga: r.ga,
      gd: r.gd,
      rank: r.rank,
    })),
  );
  await group.save();
  return group.standings;
}
