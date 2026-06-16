import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../store/authSlice';
import { Button } from '../components/ui/Button';
import { GoogleButton } from '../components/auth/GoogleButton';

type Mode = 'login' | 'register';

interface ApiErrorShape {
  response?: { data?: { error?: { message?: string } } };
}

export default function Login() {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/';

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(name, email, password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = (err as ApiErrorShape).response?.data?.error?.message ?? 'Something went wrong';
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-6 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass w-full max-w-md p-8"
      >
        <h1 className="font-display text-3xl font-bold">
          {mode === 'login' ? 'Welcome back' : 'Join the prediction'}
        </h1>
        <p className="mt-1 text-sm text-white/50">
          {mode === 'login' ? 'Sign in to track your predictions.' : 'Create an account to start predicting.'}
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {mode === 'register' && (
            <Field label="Name" value={name} onChange={setName} type="text" autoComplete="name" />
          )}
          <Field label="Email" value={email} onChange={setEmail} type="email" autoComplete="email" />
          <Field
            label="Password"
            value={password}
            onChange={setPassword}
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button type="submit" disabled={busy} className="w-full">
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-white/30">
          <span className="h-px flex-1 bg-white/10" /> OR <span className="h-px flex-1 bg-white/10" />
        </div>
        <GoogleButton />

        <p className="mt-6 text-center text-sm text-white/50">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-primary hover:underline"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        <p className="mt-4 text-center text-xs text-white/30">
          <Link to="/" className="hover:text-white/60">← Back to home</Link>
        </p>
      </motion.div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wide text-white/50">{label}</span>
      <input
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </label>
  );
}
