'use client';

import clsx from 'clsx';

import { useTx } from '@/i18n/use-tx';

interface FocusLabelProps {
  label: string;
}

export function FocusLabel({ label }: FocusLabelProps) {
  const tx = useTx();
  return (
    <div className={clsx('px-1', 'select-none', 'hover:bg-background', 'text-accent-purple-foreground rounded-md')}>
      <span aria-label={tx('ui.rsform.termGraph.focus.cstAria', 'Focus constituenta')} className='whitespace-nowrap'>
        {tx('ui.rsform.termGraph.focus.shortLabel', 'Focus')}
        <b> {label} </b>
      </span>
    </div>
  );
}
