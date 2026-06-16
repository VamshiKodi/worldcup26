import { useState } from 'react';
import { useAuth } from '../store/authSlice';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Badge } from '../components/ui/Badge';
import { AdminAnalytics } from '../components/admin/AdminAnalytics';
import { AdminTeams } from '../components/admin/AdminTeams';
import { AdminPlayers } from '../components/admin/AdminPlayers';
import { AdminMatches } from '../components/admin/AdminMatches';
import { AdminModeration } from '../components/admin/AdminModeration';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'teams', label: 'Teams' },
  { key: 'players', label: 'Players' },
  { key: 'matches', label: 'Matches' },
  { key: 'moderation', label: 'Moderation' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

/**
 * Admin dashboard — analytics overview + CRUD for teams/players/matches and
 * comment moderation. Guarded by ProtectedRoute(adminOnly); all writes hit
 * admin-only endpoints that re-check the role server-side.
 */
export default function Admin() {
  const user = useAuth((s) => s.user);
  const [tab, setTab] = useState<TabKey>('overview');

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-32">
      <SectionHeading
        eyebrow={`Signed in as ${user?.name ?? 'admin'}`}
        title="Admin Dashboard"
        subtitle="Manage tournament data, settle results and moderate the community."
        right={<Badge tone="accent">Admin</Badge>}
      />

      <div className="mb-8 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition ${
              tab === t.key ? 'bg-primary text-bg' : 'glass text-white/70 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <AdminAnalytics />}
      {tab === 'teams' && <AdminTeams />}
      {tab === 'players' && <AdminPlayers />}
      {tab === 'matches' && <AdminMatches />}
      {tab === 'moderation' && <AdminModeration />}
    </main>
  );
}
