'use client';

import clsx from 'clsx';

import { useTx } from '@/i18n';

interface FocusLabelProps {
  label: string;
}

export function FocusLabel({ label }: FocusLabelProps) {
  const tx = useTx();
  return (
    <div className={clsx('px-1', 'select-none', 'hover:bg-background', 'text-accent-purple-foreground rounded-md')}>
      <span aria-label={tx('tx.termGraph.focus')} className='whitespace-nowrap'>
        {tx('tx.termGraph.focus.short')}
        <b> {label} </b>
      </span>
    </div>
  );
}
