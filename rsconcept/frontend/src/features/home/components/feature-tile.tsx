import { Link } from 'react-router';
import clsx from 'clsx';

import { cn } from '@/components/utils';

interface FeatureTileProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  accentClass: string;
}

export function FeatureTile({ to, icon, title, description, accentClass }: FeatureTileProps) {
  return (
    <Link
      itemProp='itemListElement'
      to={to}
      className={clsx(
        'group relative flex flex-col gap-2 py-4 px-4 overflow-hidden',
        'border bg-muted shadow-sm rounded-xl',
        'hover:-translate-y-0.5 hover:border-primary-border hover:shadow-md focus-outline',
        'transition-[border-color,box-shadow,transform] duration-transform ease-bezier'
      )}
    >
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -right-6 -top-6',
          'h-16 w-16 rounded-full',
          'opacity-35 blur-xl group-hover:opacity-55',
          'transition-opacity duration-fade ease-bezier',
          accentClass
        )}
      />
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -left-2 -bottom-2',
          'h-12 w-12 rounded-full',
          'opacity-35 blur-xl group-hover:opacity-55',
          'transition-opacity duration-fade ease-bezier',
          accentClass
        )}
      />

      <div className='relative flex items-start gap-4' >
        <span
          className={clsx(
            'h-11 w-11 shrink-0',
            'flex items-center justify-center',
            'rounded-lg border bg-muted text-primary'
          )}
        >
          {icon}
        </span>
        <div className='min-w-0 flex-1 -mt-1 sm:-mt-1.5'>
          <h3 className='text-lg font-medium tracking-tight text-foreground'>{title}</h3>
          <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>{description}</p>
        </div>
      </div>
    </Link>
  );
}