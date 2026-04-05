import { Link } from 'react-router';
import clsx from 'clsx';

import { cn } from '@/components/utils';
import { globalIDs } from '@/utils/constants';

export type CtaVariant = 'default' | 'sandbox' | 'create';

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
        'group relative inline-flex h-12 w-46 max-w-full shrink-0 overflow-hidden',
        'items-center justify-center gap-2 px-5 py-2.5',
        'rounded-2xl border',
        'font-medium tracking-tight font-ui select-none',
        'cc-animate-color focus-outline backdrop-blur-md',
        'shadow-[0_6px_18px_-14px_rgb(15_23_42/0.35)] dark:shadow-[0_8px_20px_-16px_rgb(0_0_0/0.55)]',
        'before:absolute before:inset-x-7 before:top-0 before:h-px before:rounded-full before:bg-current before:opacity-70 before:content-[""]',
        'after:absolute after:inset-x-4 after:bottom-0 after:h-px after:rounded-full after:bg-current after:opacity-55 after:transition-opacity after:duration-200 after:content-[""]',
        'hover:after:opacity-80',
        variant === 'default' &&
        clsx(
          'border-accent-blue/75 bg-accent-blue/7 text-accent-blue-foreground',
          'hover:border-accent-blue hover:bg-accent-blue/11 hover:text-accent-blue-foreground',
          'dark:border-accent-blue/78 dark:bg-accent-blue/13',
          'dark:hover:border-accent-blue dark:hover:bg-accent-blue/20'
        ),
        variant === 'sandbox' &&
        clsx(
          'border-accent-green/75 bg-accent-green/7 text-accent-green-foreground',
          'hover:border-accent-green hover:bg-accent-green/11 hover:text-accent-green-foreground',
          'dark:border-accent-green/78 dark:bg-accent-green/13',
          'dark:hover:border-accent-green dark:hover:bg-accent-green/20'
        ),
        variant === 'create' &&
        clsx(
          'border-accent-orange/75 bg-accent-orange/7 text-accent-orange-foreground',
          'hover:border-accent-orange hover:bg-accent-orange/11 hover:text-accent-orange-foreground',
          'dark:border-accent-orange/78 dark:bg-accent-orange/13',
          'dark:hover:border-accent-orange dark:hover:bg-accent-orange/20'
        ),
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 rounded-2xl opacity-90 transition-opacity duration-200 group-hover:opacity-100',
          variant === 'sandbox' && 'bg-linear-to-r from-transparent via-accent-teal/12 to-transparent dark:via-accent-teal/20',
          variant === 'create' && 'bg-linear-to-r from-transparent via-accent-orange/12 to-transparent dark:via-accent-orange/20',
          variant === 'default' && 'bg-linear-to-r from-transparent via-accent-blue/12 to-transparent dark:via-accent-blue/20'
        )}
      />
      {icon}
      <span>{text}</span>
    </Link>
  );
}
