import { create } from 'zustand';

export type ToastTone = 'goal' | 'info' | 'success';

export interface Toast {
  id: number;
  title: string;
  detail?: string;
  tone: ToastTone;
}

interface ToastState {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;
const TTL_MS = 5000;

/**
 * Minimal toast queue (Phase 9) — no external dependency. The <Toaster/> component
 * renders these; `pushToast` is the convenience entry point used by the live socket layer.
 */
export const useToasts = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
    }, TTL_MS);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

export function pushToast(t: Omit<Toast, 'id'>): void {
  useToasts.getState().push(t);
}
