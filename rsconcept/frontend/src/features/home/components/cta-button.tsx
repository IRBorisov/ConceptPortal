import { Link } from 'react-router';
import clsx from 'clsx';

import { cn } from '@/components/utils';
import { globalIDs } from '@/utils/constants';

export type CtaVariant = 'default' | 'primary';

interface CtaButtonProps {
  to: string;
  text: string;
  icon: React.ReactNode;
  variant?: CtaVariant;
  title?: string;
  className?: string;
}

export function CtaButton({ to, text, variant = 'default', icon, title, className }: CtaButtonProps) {
  return (
    <Link
      to={to}
      aria-label={title ?? text}
      data-tooltip-id={title ? globalIDs.tooltip : undefined}
      data-tooltip-content={title}
      className={cn(
        'group relative inline-flex w-46 max-w-full shrink-0 overflow-hidden',
        'items-center justify-center gap-2 px-6 py-3',
        'rounded-2xl border-2',
        'font-medium tracking-tight font-ui select-none',
        'focus-outline backdrop-blur-md',
        'transition-all duration-200',
        'shadow-[0_6px_16px_-12px_rgb(15_23_42/0.55)] dark:shadow-[0_8px_24px_-14px_rgb(130_141_159/0.60)]',
        'hover:shadow-none dark:hover:shadow-none',
        variant === 'default' &&
          clsx(
            'border-accent-blue/75 hover:border-accent-blue/90 text-accent-blue-foreground',
            'bg-accent-blue/15 hover:bg-accent-blue/25',
            'dark:bg-accent-blue/10 dark:hover:bg-accent-blue/30 dark:hover:text-foreground'
          ),
        variant === 'primary' &&
          clsx(
            'border-accent-green/90 hover:border-accent-green text-accent-green-foreground',
            'bg-accent-green/15 hover:bg-accent-green/25',
            'dark:bg-accent-green/10 dark:hover:bg-accent-green/30 dark:hover:text-foreground'
          ),
        className
      )}
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
}
