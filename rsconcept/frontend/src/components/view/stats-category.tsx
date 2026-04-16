import { useState } from 'react';
import clsx from 'clsx';
import { useDebounce } from 'use-debounce';

import { cn } from '@/components/utils';
import { globalIDs, PARAMETER } from '@/utils/constants';

interface StatsCategoryProps {
  id: string;
  className?: string;
  label?: string;
  primaryLabel: string;
  primaryValue: number;
  primaryTitle?: string;
  secondaryLabel?: string;
  secondaryValue?: number;
  secondaryTitle?: string;
  details: { label: string; value: number; danger?: boolean }[];
}

/** Displays a category of statistics. */
export function StatsCategory({
  id,
  className,
  label,
  primaryLabel,
  primaryValue,
  primaryTitle,
  secondaryLabel,
  secondaryValue,
  secondaryTitle,
  details
}: StatsCategoryProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isOpenDebounced] = useDebounce(isDetailsOpen, PARAMETER.summaryDuration);
  const hasSecondary = secondaryLabel && typeof secondaryValue === 'number';

  function handleDetailsToggle(event: React.SyntheticEvent<HTMLDetailsElement>) {
    setIsDetailsOpen(event.currentTarget.open);
  }

  return (
    <section id={id} className={cn('min-h-28', 'rounded-md border bg-card px-3 py-2', 'grid gap-2', className)}>
      {label ? <h3 className='text-sm font-medium leading-none mt-1'>{label}</h3> : null}

      {!isDetailsOpen && !isOpenDebounced ? (
        <div className={clsx('grid gap-3 cc-fade-in', hasSecondary ? 'grid-cols-2' : 'grid-cols-1')}>
          <ValueCard label={primaryLabel} title={primaryTitle} value={primaryValue} />
          {hasSecondary ? <ValueCard label={secondaryLabel} title={secondaryTitle} value={secondaryValue} /> : null}
        </div>
      ) : null}

      <details className='group -mt-1' onToggle={handleDetailsToggle}>
        <summary className='text-muted-foreground hover:text-foreground cursor-pointer text-xs select-none'>
          Подробнее
        </summary>
        <div className='grid gap-1 pt-1 text-xs'>
          {details.map(detail => (
            <div key={detail.label} className='flex items-center justify-between gap-2'>
              <span className={detail.danger ? 'text-destructive' : undefined}>{detail.label}</span>
              <span className={clsx('font-math', detail.danger && 'text-destructive')}>{detail.value}</span>
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}

function ValueCard({ label, title, value }: { label: string; title?: string; value: number }) {
  return (
    <div
      className='rounded-sm bg-muted px-2 py-1 dense text-center'
      data-tooltip-id={!!title ? globalIDs.tooltip : undefined}
      data-tooltip-html={title}
    >
      <p className='text-muted-foreground text-xs'>{label}</p>
      <p className='font-math text-base leading-none py-1'>{value}</p>
    </div>
  );
}
