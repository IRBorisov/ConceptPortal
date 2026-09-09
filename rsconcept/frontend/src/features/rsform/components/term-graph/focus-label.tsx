'use client';

import { useTx } from '@/i18n';

import { cn } from '@/components/utils';

interface FocusLabelProps {
  label: string;
}

export function FocusLabel({ label }: FocusLabelProps) {
  const tx = useTx();
  return (
    <div className={cn('px-1', 'select-none', 'hover:bg-background', 'text-accent-purple-foreground rounded-md')}>
      <span aria-label={tx('tx.termGraph.focus')} className='whitespace-nowrap'>
        {tx('tx.termGraph.focus.short')}
        <b> {label} </b>
      </span>
    </div>
  );
}
