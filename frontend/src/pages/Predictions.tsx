import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/authSlice';
import { usePredictions } from '../store/predictionSlice';
import { SectionHeading } from '../components/ui/SectionHeading';
import { MatchesTab } from '../components/predict/MatchesTab';
import { GroupsTab } from '../components/predict/GroupsTab';
import { BracketTab } from '../components/predict/BracketTab';
import { WinnerTab } from '../components/predict/WinnerTab';

const TABS = [
  { key: 'matches', label: 'Matches' },
  { key: 'groups', label: 'Groups' },
  { key: 'bracket', label: 'Bracket' },
  { key: 'winner', label: 'Winner' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function Predictions() {
  const user = useAuth((s) => s.user);
  const load = usePredictions((s) => s.load);
  const [tab, setTab] = useState<TabKey>('matches');

  // Load the user's saved picks once on mount.
  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="mx-auto max-w-4xl px-6 pb-24 pt-32">
      <SectionHeading
        eyebrow={`Welcome, ${user?.name ?? 'predictor'}`}
        title="Your Predictions"
        subtitle="Call the matches, groups, knockouts and champion. Points settle as results come in."
        right={
          <Link to="/lab" className="text-sm text-primary hover:underline">
            AI Lab →
          </Link>
        }
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

      {tab === 'matches' && <MatchesTab />}
      {tab === 'groups' && <GroupsTab />}
      {tab === 'bracket' && <BracketTab />}
      {tab === 'winner' && <WinnerTab />}
    </main>
  );
}
