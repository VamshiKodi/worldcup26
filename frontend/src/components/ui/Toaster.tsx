import { AnimatePresence, motion } from 'framer-motion';
import { useToasts, type ToastTone } from '../../lib/toast';

const toneStyles: Record<ToastTone, string> = {
  goal: 'border-red-500/40 shadow-[0_0_30px_-8px] shadow-red-500/40',
  success: 'border-accent/40',
  info: 'border-primary/40',
};

const toneEmoji: Record<ToastTone, string> = {
  goal: '⚽',
  success: '✓',
  info: '•',
};

/**
 * Fixed-position toast stack (Phase 9). Mounted once at the root. Reads the global
 * toast queue; respects prefers-reduced-motion via the app-level MotionConfig.
 */
export function Toaster() {
  const toasts = useToasts((s) => s.toasts);
  const dismiss = useToasts((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-80 max-w-[calc(100vw-3rem)] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            layout
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={() => dismiss(t.id)}
            className={`glass pointer-events-auto flex items-start gap-3 border px-4 py-3 text-left ${toneStyles[t.tone]}`}
          >
            <span className="text-lg leading-none">{toneEmoji[t.tone]}</span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{t.title}</span>
              {t.detail && <span className="block text-xs text-white/50">{t.detail}</span>}
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
