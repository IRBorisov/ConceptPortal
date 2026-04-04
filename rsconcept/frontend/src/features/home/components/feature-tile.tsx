import { Link } from 'react-router';

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
      to={to}
      className={cn(
        'group relative flex flex-col gap-2 overflow-hidden rounded-xl border border-prim-200/80 bg-prim-0/80 p-5 shadow-sm',
        'transition-[border-color,box-shadow,transform] duration-transform ease-bezier',
        'hover:-translate-y-0.5 hover:border-sec-400/50 hover:shadow-md',
        'dark:border-prim-400/30 dark:bg-prim-100/40'
      )}
    >
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full opacity-35 blur-xl transition-opacity group-hover:opacity-55',
          accentClass
        )}
      />
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -left-2 -bottom-2 h-12 w-12 rounded-full opacity-35 blur-xl transition-opacity group-hover:opacity-55',
          accentClass
        )}
      />
      <div className='relative flex items-start gap-3'>
        <span
          className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border bg-muted text-primary'
        >
          {icon}
        </span>
        <div className='min-w-0 flex-1'>
          <h3 className='text-lg font-medium tracking-tight text-foreground'>{title}</h3>
          <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>{description}</p>
        </div>
      </div>
    </Link>
  );
}