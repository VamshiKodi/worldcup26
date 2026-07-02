import type { Server as SocketServer } from 'socket.io';
import { TeamModel, GroupModel, MatchModel, PlayerModel } from '../models/index.js';
import { env } from '../config/env.js';
import { referenceCache } from '../utils/cache.js';
import { settleMatch } from './scoringService.js';
import { recomputeGroupStandings } from './standingsService.js';
import {
  getTeams,
  getStandings,
  getMatches,
  getLiveMatches,
  getScorers,
  isRestricted,
} from './footballData.js';
import type { FDMatch } from './footballData.js';
import { buildFinishedEvents, buildLiveGoal } from './matchEvents.js';
import {
  confederationOf,
  mapFdStage,
  mapFdStatus,
  groupLetter,
  parseForm,
  mapPosition,
  uniqueCode,
} from './wcMapping.js';
import { fifaRankingOf } from './fifaRankings.js';

const HOSTS = new Set(['United States', 'USA', 'Canada', 'Mexico']);

/**
 * Derive a match clock from kickoff — the free tier never sends a `minute`. Models a 15-minute
 * half-time break so the second half reads 45'–90' rather than running straight through.
 */
function liveMinute(kickoff: Date): number {
  const elapsed = Math.floor((Date.now() - new Date(kickoff).getTime()) / 60_000);
  if (elapsed <= 0) return 1;
  if (elapsed <= 45) return elapsed;
  if (elapsed <= 60) return 45; // half-time interval
  if (elapsed <= 105) return elapsed - 15;
  return 90;
}

/** Real match details available on the free tier (half-time score, referee, winner, duration). */
function detailsFrom(f: FDMatch) {
  return {
    halfTime: { home: f.score.halfTime?.home ?? null, away: f.score.halfTime?.away ?? null },
    referee: f.referees?.find((r) => r.type === 'REFEREE')?.name ?? f.referees?.[0]?.name ?? '',
    winner: f.score.winner ?? null,
    duration: f.score.duration ?? 'REGULAR',
  };
}

/** Resolve a team reference (populated doc or raw id) to its string _id, or null for TBD. */
function teamObjId(ref: unknown): string | null {
  if (!ref) return null;
  if (typeof ref === 'object' && ref !== null && '_id' in ref) return String((ref as { _id: unknown })._id);
  return String(ref);
}

/**
 * Full import of real World Cup data from football-data.org into our collections. Idempotent:
 * everything upserts by `apiId`, so re-running refreshes in place without duplicates. Returns
 * counts for logging. Players (top scorers) are imported separately via importScorers().
 */
export async function importStaticData(): Promise<{ teams: number; groups: number; matches: number }> {
  // 0) Real data owns these collections. Drop any legacy seed rows (no external `apiId`) so the
  // unique `code` index can't collide with real teams and the dataset ends up 100% real. Real
  // rows (with `apiId`) are kept and refreshed in place by the upserts below, so match/team _ids
  // stay stable across re-imports (predictions/standings references survive).
  await Promise.all([
    TeamModel.deleteMany({ apiId: { $exists: false } }),
    MatchModel.deleteMany({ apiId: { $exists: false } }),
    PlayerModel.deleteMany({ apiId: { $exists: false } }),
  ]);

  // 1) Teams ----------------------------------------------------------------
  const teamsRes = await getTeams();
  const usedCodes = new Set<string>();
  const teamByApiId = new Map<number, string>(); // apiId → our _id

  for (const t of teamsRes.teams) {
    const code = uniqueCode(t.name, t.tla, usedCodes);
    const doc = await TeamModel.findOneAndUpdate(
      { apiId: t.id },
      {
        apiId: t.id,
        name: t.name,
        code,
        confederation: confederationOf(t.area.name),
        flagUrl: t.crest ?? '',
        fifaRanking: fifaRankingOf(t.tla, t.area.name),
        isHost: HOSTS.has(t.area.name),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    teamByApiId.set(t.id, String(doc._id));
  }

  // 2) Standings → groups + real form/stats (when available pre-/in-tournament) -------------
  const groupByLetter = new Map<string, string>(); // 'A' → group _id
  let standingsRes;
  try {
    standingsRes = await getStandings();
  } catch (err) {
    if (!isRestricted(err)) throw err;
    standingsRes = null; // not on plan / not published yet → fall back to fixtures for groups
  }

  const tables = (standingsRes?.standings ?? []).filter((s) => s.type === 'TOTAL');
  for (const table of tables) {
    const letter = groupLetter(table.group);
    if (!letter) continue;

    const teamIds = table.table.map((r) => teamByApiId.get(r.team.id)).filter(Boolean) as string[];
    const standings = table.table.map((r) => ({
      teamId: teamByApiId.get(r.team.id),
      played: r.playedGames,
      points: r.points,
      gf: r.goalsFor,
      ga: r.goalsAgainst,
      gd: r.goalDifference,
      rank: r.position,
    }));
    const group = await GroupModel.findOneAndUpdate(
      { name: letter },
      { name: letter, teamIds, standings },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    groupByLetter.set(letter, String(group._id));

    // Real recent form + cumulative stats straight from the standings row.
    for (const r of table.table) {
      const id = teamByApiId.get(r.team.id);
      if (!id) continue;
      await TeamModel.updateOne(
        { _id: id },
        {
          groupId: group._id,
          form: parseForm(r.form),
          stats: {
            played: r.playedGames,
            won: r.won,
            draw: r.draw,
            lost: r.lost,
            gf: r.goalsFor,
            ga: r.goalsAgainst,
          },
        },
      );
    }
  }

  // 3) Matches --------------------------------------------------------------
  // Import the full schedule, including knockout slots whose teams are still TBD before the
  // draw (homeTeamId/awayTeamId stay null — the frontend renders these as "To be determined").
  const matchesRes = await getMatches();
  const koCounter = new Map<string, number>(); // per-stage running index for bracketSlot labels
  let matchCount = 0;
  for (const f of matchesRes.matches) {
    const homeId = teamByApiId.get(f.homeTeam.id) ?? null;
    const awayId = teamByApiId.get(f.awayTeam.id) ?? null;
    const letter = groupLetter(f.group);
    // Group fixtures must have both teams (skip any malformed row); knockouts may be TBD.
    if (letter && (!homeId || !awayId)) continue;

    let groupId: string | null = null;
    if (letter) {
      groupId = groupByLetter.get(letter) ?? null;
      if (!groupId) {
        // Ensure a group doc exists even if standings were unavailable.
        const g = await GroupModel.findOneAndUpdate(
          { name: letter },
          { name: letter },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );
        groupId = String(g._id);
        groupByLetter.set(letter, groupId);
      }
    }

    const stage = mapFdStage(f.stage);
    let bracketSlot: string | null = null;
    if (stage !== 'group') {
      const n = (koCounter.get(stage) ?? 0) + 1;
      koCounter.set(stage, n);
      bracketSlot = `${stage.toUpperCase()}-${n}`;
    }

    await MatchModel.findOneAndUpdate(
      { apiId: f.id },
      {
        apiId: f.id,
        stage,
        groupId,
        homeTeamId: homeId,
        awayTeamId: awayId,
        venue: f.venue ?? '',
        kickoff: new Date(f.utcDate),
        status: mapFdStatus(f.status),
        minute: f.minute ?? 0,
        score: { home: f.score.fullTime.home, away: f.score.fullTime.away },
        ...detailsFrom(f),
        round: f.matchday ?? 1,
        bracketSlot,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    matchCount++;
  }

  referenceCache.clear();
  return { teams: teamByApiId.size, groups: groupByLetter.size, matches: matchCount };
}

/**
 * Import real top scorers as players + their season stats. The free tier exposes the scorers
 * list (not full squads), which is exactly what the player showcase / golden-boot race needs.
 * Idempotent — upserts by `apiId`.
 */
export async function importScorers(limit = 100): Promise<{ players: number }> {
  const teams = await TeamModel.find({ apiId: { $ne: null } }).select('_id apiId').lean();
  const teamByApiId = new Map<number, string>(teams.map((t) => [t.apiId as number, String(t._id)]));

  const res = await getScorers(limit);
  let count = 0;
  for (let i = 0; i < res.scorers.length; i++) {
    const s = res.scorers[i];
    const teamId = teamByApiId.get(s.team.id);
    if (!teamId) continue;
    await PlayerModel.findOneAndUpdate(
      { apiId: s.player.id },
      {
        apiId: s.player.id,
        name: s.player.name,
        teamId,
        position: mapPosition(s.player.position),
        number: s.player.shirtNumber ?? undefined,
        stats: {
          goals: s.goals ?? 0,
          assists: s.assists ?? 0,
          appearances: s.playedMatches ?? 0,
        },
        isTopScorer: i < 10, // ranked list — flag the leaders for the golden-boot UI
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    count++;
  }
  referenceCache.clear();
  return { players: count };
}

/**
 * Live sync: poll football-data.org for in-play fixtures and broadcast over the same Socket.io
 * channels the simulated engine uses (Phase 9), so the frontend is unchanged. On full time we
 * settle predictions + recompute standings, exactly like admin score entry. Returns a stop fn.
 */
export function startLiveSync(io: SocketServer): () => void {
  const teamFields = 'name code';

  async function poll(): Promise<void> {
    const res = await getLiveMatches();
    for (const f of res.matches) {
      const match = await MatchModel.findOne({ apiId: f.id })
        .populate('homeTeamId', teamFields)
        .populate('awayTeamId', teamFields);
      if (!match) continue;

      const prevHome = match.score?.home ?? 0;
      const prevAway = match.score?.away ?? 0;
      const newHome = f.score.fullTime.home ?? prevHome;
      const newAway = f.score.fullTime.away ?? prevAway;
      const newStatus = mapFdStatus(f.status);
      const finished = newStatus === 'finished';
      const minute = finished ? match.minute || 90 : liveMinute(match.kickoff);

      const homeId = teamObjId(match.homeTeamId);
      const awayId = teamObjId(match.awayTeamId);
      const scoredSide = newHome > prevHome ? 'home' : newAway > prevAway ? 'away' : undefined;

      match.score = { home: newHome, away: newAway };
      match.minute = minute;
      match.status = newStatus;
      Object.assign(match, detailsFrom(f));

      // Synthesise a scorer for the goal that was just registered (live), so the timeline grows
      // in real time. `liveEvent` carries the resolved player so the socket tick can show a name.
      let liveEvent: { minute: number; type: string; teamId: string; playerId: { _id: string; name: string; photoUrl?: string } | null } | undefined;
      const scoringTeamId = scoredSide === 'home' ? homeId : scoredSide === 'away' ? awayId : null;
      if (scoringTeamId) {
        const { event, player } = await buildLiveGoal(scoringTeamId, minute);
        match.set('events', [...(match.events ?? []), event]);
        liveEvent = { minute: event.minute, type: event.type, teamId: event.teamId, playerId: player };
      }

      // At full time, ensure the timeline matches the final scoreline (covers goals that landed
      // before this sync first observed the match, or while the server was down).
      if (finished && homeId && awayId && (match.events?.length ?? 0) < newHome + newAway) {
        match.set('events', await buildFinishedEvents(homeId, awayId, newHome, newAway));
      }

      await match.save();

      const matchId = String(match._id);
      const score = { home: newHome, away: newAway };
      const home = match.homeTeamId as unknown as { name?: string; code?: string };
      const away = match.awayTeamId as unknown as { name?: string; code?: string };
      const teams = {
        home: { name: home?.name ?? 'Home', code: home?.code ?? '?' },
        away: { name: away?.name ?? 'Away', code: away?.code ?? '?' },
      };

      io.to(`match:${matchId}`).emit('match:tick', { matchId, minute, score, status: newStatus, event: liveEvent });
      io.to('matches:live').emit('matches:update', { matchId, minute, score, status: newStatus, teams, scoredSide });

      if (finished) {
        if (match.groupId) await recomputeGroupStandings(String(match.groupId));
        const { settled } = await settleMatch(matchId);
        referenceCache.clear();
        io.to(`match:${matchId}`).emit('match:final', { matchId, score, settled });
        io.to('matches:live').emit('matches:update', { matchId, minute, score, status: 'finished', teams });
      }
    }
  }

  const run = () => poll().catch((err) => console.error('[liveSync] poll error:', err));
  run(); // immediate first pass
  const interval = setInterval(run, Math.max(30_000, env.footballData.livePollMs));
  interval.unref?.();
  console.log('📡 Real-data live sync started (football-data.org)');
  return () => clearInterval(interval);
}

/**
 * Result reconciliation: poll the *full* fixture list (not just in-play) and write back any
 * match whose real status/score has changed. This is the safety net the live-only poll lacks —
 * it catches matches that finished while the server was off, or that the delayed free tier never
 * surfaced as LIVE at the exact poll instant, so finished results always land without a manual
 * re-import. On a match newly transitioning to finished we settle predictions + recompute
 * standings and broadcast, exactly like startLiveSync / admin score entry. Returns a stop fn.
 */
export function startResultSync(io: SocketServer): () => void {
  const teamFields = 'name code';

  async function reconcile(): Promise<void> {
    let res;
    try {
      res = await getMatches();
    } catch (err) {
      // Restricted/quota errors shouldn't kill the loop — just skip this cycle.
      if (isRestricted(err)) return;
      throw err;
    }

    const teams = await TeamModel.find({ apiId: { $ne: null } }).select('_id apiId').lean();
    const teamByApiId = new Map<number, string>(
      teams.map((team) => [team.apiId as number, String(team._id)]),
    );

    for (const f of res.matches) {
      const match = await MatchModel.findOne({ apiId: f.id })
        .populate('homeTeamId', teamFields)
        .populate('awayTeamId', teamFields);
      if (!match) continue;

      const homeId = teamByApiId.get(f.homeTeam.id) ?? null;
      const awayId = teamByApiId.get(f.awayTeam.id) ?? null;
      const kickoff = new Date(f.utcDate);
      const scheduleChanged =
        teamObjId(match.homeTeamId) !== homeId ||
        teamObjId(match.awayTeamId) !== awayId ||
        match.kickoff.getTime() !== kickoff.getTime() ||
        match.venue !== (f.venue ?? '');

      if (scheduleChanged) {
        match.set('homeTeamId', homeId);
        match.set('awayTeamId', awayId);
        match.kickoff = kickoff;
        match.venue = f.venue ?? '';
      }

      // A finished result is terminal: never revert it (the free tier can momentarily flap a
      // completed fixture back to TIMED) and never re-settle it. We do still backfill a simulated
      // timeline once for finished matches missing one (imported before this feature, or that
      // completed while the server was down), then move on.
      if (match.status === 'finished') {
        if ((match.events?.length ?? 0) === 0 && homeId && awayId && match.score?.home != null) {
          Object.assign(match, detailsFrom(f));
          match.set('events', await buildFinishedEvents(homeId, awayId, match.score.home, match.score.away ?? 0));
          await match.save();
        } else if (scheduleChanged) {
          await match.save();
        }
        continue;
      }

      const prevHome = match.score?.home ?? null;
      const prevAway = match.score?.away ?? null;
      const newHome = f.score.fullTime.home ?? prevHome;
      const newAway = f.score.fullTime.away ?? prevAway;
      const newStatus = mapFdStatus(f.status);
      const minute =
        newStatus === 'live' ? liveMinute(match.kickoff) : newStatus === 'finished' ? match.minute || 90 : 0;

      // Nothing changed since our last sync — leave the row (and predictions) untouched.
      if (match.status === newStatus && prevHome === newHome && prevAway === newAway) {
        if (scheduleChanged) await match.save();
        continue;
      }

      match.score = { home: newHome, away: newAway };
      match.minute = minute;
      match.status = newStatus;
      Object.assign(match, detailsFrom(f));
      if (newStatus === 'finished' && homeId && awayId && (match.events?.length ?? 0) === 0) {
        match.set('events', await buildFinishedEvents(homeId, awayId, newHome ?? 0, newAway ?? 0));
      }
      await match.save();

      const matchId = String(match._id);
      const score = { home: newHome, away: newAway };
      const home = match.homeTeamId as unknown as { name?: string; code?: string };
      const away = match.awayTeamId as unknown as { name?: string; code?: string };
      const teams = {
        home: { name: home?.name ?? 'Home', code: home?.code ?? '?' },
        away: { name: away?.name ?? 'Away', code: away?.code ?? '?' },
      };

      io.to(`match:${matchId}`).emit('match:tick', { matchId, minute, score, status: newStatus });
      io.to('matches:live').emit('matches:update', { matchId, minute, score, status: newStatus, teams });

      // Settle exactly once, on the scheduled/live → finished transition (finished rows are
      // skipped above, so reaching here with 'finished' is always a fresh completion).
      if (newStatus === 'finished') {
        if (match.groupId) await recomputeGroupStandings(String(match.groupId));
        const { settled } = await settleMatch(matchId);
        referenceCache.clear();
        io.to(`match:${matchId}`).emit('match:final', { matchId, score, settled });
        io.to('matches:live').emit('matches:update', { matchId, minute, score, status: 'finished', teams });
        console.log(`✅ Result synced: ${teams.home.code} ${newHome}-${newAway} ${teams.away.code} (settled ${settled})`);
      }
    }
  }

  const run = () => reconcile().catch((err) => console.error('[resultSync] reconcile error:', err));
  run(); // immediate first pass — flips any already-finished-but-stuck fixtures on startup
  const interval = setInterval(run, Math.max(60_000, env.footballData.resultPollMs));
  interval.unref?.();
  console.log('🔁 Real-data result reconciliation started (football-data.org)');
  return () => clearInterval(interval);
}

/**
 * Static-data refresh: the live/result loops above only touch match scores, so top scorers,
 * team form/stats, standings and newly-drawn knockout teams would otherwise go stale until a
 * manual re-import. This loop periodically re-runs the idempotent static import + scorers import
 * so the golden-boot race and group tables stay current with zero manual steps. Restricted/quota
 * errors are swallowed so one bad cycle never kills the loop. Returns a stop fn.
 */
export function startStaticSync(): () => void {
  async function refresh(): Promise<void> {
    try {
      const { teams, groups, matches } = await importStaticData();
      const { players } = await importScorers();
      console.log(
        `♻️  Static refresh: ${teams} teams · ${groups} groups · ${matches} fixtures · ${players} scorers`,
      );
    } catch (err) {
      if (isRestricted(err)) return; // quota / plan limit — try again next cycle
      console.error('[staticSync] refresh error:', err);
    }
  }

  // No immediate pass here — the caller imports once on boot; this only handles ongoing refresh.
  const interval = setInterval(() => void refresh(), Math.max(120_000, env.footballData.staticPollMs));
  interval.unref?.();
  console.log('♻️  Real-data static refresh started (teams/standings/scorers)');
  return () => clearInterval(interval);
}
