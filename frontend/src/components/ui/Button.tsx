import { type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'ghost' | 'accent';

const styles: Record<Variant, string> = {
  primary: 'bg-primary text-bg shadow-glow hover:brightness-110',
  accent: 'bg-accent text-bg shadow-glow-accent hover:brightness-110',
  ghost: 'glass text-white hover:border-primary/50',
};

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`rounded-full px-6 py-2.5 text-sm font-semibold transition active:scale-95 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
