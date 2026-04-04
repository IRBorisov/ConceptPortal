import { Link } from 'react-router';

import { cn } from '@/components/utils';
import { globalIDs } from '@/utils/constants';

export type CtaVariant = 'default' | 'sandbox' | 'create' | 'manuals' | 'login';

interface CtaButtonProps {
  to: string;
  /** Visible label (and main accessible name together with icon). */
  text: string;
  variant?: CtaVariant;
  icon?: React.ReactNode;
  tooltip?: string;
  className?: string;
}

/**
 * Landing hero actions: one neutral style plus an optional sandbox accent. No heavy shadows — readable in dark mode.
 */
export function CtaButton({ to, text, variant = 'default', icon, tooltip, className }: CtaButtonProps) {
  return (
    <Link
      to={to}
      aria-label={tooltip ?? text}
      data-tooltip-id={tooltip ? globalIDs.tooltip : undefined}
      data-tooltip-content={tooltip}
      className={cn(
        'group relative inline-flex h-12 w-46 max-w-full shrink-0 items-center justify-center gap-2 overflow-hidden rounded-2xl border px-5 py-2.5 font-medium tracking-tight font-ui cc-animate-color focus-outline select-none backdrop-blur-md',
        'shadow-[0_6px_18px_-14px_rgb(15_23_42_/_0.35)] dark:shadow-[0_8px_20px_-16px_rgb(0_0_0_/_0.55)]',
        'before:absolute before:inset-x-4 before:top-0 before:h-px before:rounded-full before:bg-current before:opacity-70 before:content-[""]',
        'after:absolute after:inset-x-7 after:bottom-0 after:h-px after:rounded-full after:bg-current after:opacity-55 after:transition-opacity after:duration-200 after:content-[""]',
        'hover:after:opacity-80',
        variant === 'default' &&
        cn(
          'border-border/80 bg-card/36 text-foreground',
          'hover:border-prim-400/85 hover:bg-card/56 hover:text-foreground',
          'dark:border-prim-600/55 dark:bg-prim-100/58 dark:text-prim-999',
          'dark:hover:border-prim-600/75 dark:hover:bg-prim-100/78 dark:hover:text-prim-0'
        ),
        variant === 'sandbox' &&
        cn(
          'border-accent-green/75 bg-accent-green/7 text-accent-green-foreground',
          'hover:border-accent-green hover:bg-accent-green/11 hover:text-accent-green-foreground',
          'dark:border-accent-green/78 dark:bg-accent-green/13',
          'dark:hover:border-accent-green dark:hover:bg-accent-green/20'
        ),
        variant === 'create' &&
        cn(
          'border-accent-orange/75 bg-accent-orange/7 text-accent-orange-foreground',
          'hover:border-accent-orange hover:bg-accent-orange/11 hover:text-accent-orange-foreground',
          'dark:border-accent-orange/78 dark:bg-accent-orange/13',
          'dark:hover:border-accent-orange dark:hover:bg-accent-orange/20'
        ),
        variant === 'manuals' &&
        cn(
          'border-accent-blue/75 bg-accent-blue/7 text-accent-blue-foreground',
          'hover:border-accent-blue hover:bg-accent-blue/11 hover:text-accent-blue-foreground',
          'dark:border-accent-blue/78 dark:bg-accent-blue/13',
          'dark:hover:border-accent-blue dark:hover:bg-accent-blue/20'
        ),
        variant === 'login' &&
        cn(
          'border-accent-purple/72 bg-accent-purple/8 text-accent-purple-foreground',
          'hover:border-accent-purple hover:bg-accent-purple/12 hover:text-accent-purple-foreground',
          'dark:border-accent-purple/78 dark:bg-accent-purple/14',
          'dark:hover:border-accent-purple dark:hover:bg-accent-purple/22'
        ),
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 rounded-2xl opacity-95 transition-opacity duration-200 group-hover:opacity-100',
          variant === 'default' && 'bg-linear-to-r from-transparent via-foreground/5 to-transparent dark:via-prim-0/7',
          variant === 'sandbox' && 'bg-linear-to-r from-transparent via-accent-teal/12 to-transparent dark:via-accent-teal/20',
          variant === 'create' && 'bg-linear-to-r from-transparent via-accent-orange/12 to-transparent dark:via-accent-orange/20',
          variant === 'manuals' && 'bg-linear-to-r from-transparent via-accent-blue/12 to-transparent dark:via-accent-blue/20',
          variant === 'login' && 'bg-linear-to-r from-transparent via-accent-purple/13 to-transparent dark:via-accent-purple/22'
        )}
      />
      {icon ? <span className='relative z-10 shrink-0 opacity-90 transition-transform duration-200 group-hover:-translate-y-px'>{icon}</span> : null}
      <span className='relative z-10'>{text}</span>
    </Link>
  );
}
