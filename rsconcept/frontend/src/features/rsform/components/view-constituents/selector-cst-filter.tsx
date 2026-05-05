'use client';

import { type ReactNode, useEffect } from 'react';

import { useTx } from '@/i18n';

import {
  IconChild,
  IconCrucial,
  IconFilter,
  IconGraphCore,
  IconPredecessor,
  IconStatusError,
  IconStatusIncalculable
} from '@/components/icons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/input/select';
import { cn } from '@/components/utils';

import { type CstFilterOption, useCstSearchStore } from '../../stores/cst-search';

interface SelectorCstFilterProps {
  className?: string;
  showModelFilter?: boolean;
}

export function SelectorCstFilter({ className, showModelFilter }: SelectorCstFilterProps) {
  const tx = useTx();
  const setFilter = useCstSearchStore(state => state.setFilter);
  const filter = useCstSearchStore(state => state.filter);

  useEffect(
    function resetModelIssuesFilterWhenHidden() {
      if (!showModelFilter && filter === 'model_issues') {
        setFilter('all');
      }
    },
    [filter, setFilter, showModelFilter]
  );

  const items: Record<CstFilterOption, ReactNode> = {
    all: tx('tx.general.filter'),
    schema_issues: tx('ui.filter.schemaIssuesShort'),
    model_issues: tx('ui.filter.modelIssuesShort'),
    crucial: tx('tx.lib.cst.crucial.plural'),
    kernel: tx('tx.lib.concept.basic.plural'),
    derived: tx('tx.lib.concept.derived.plural'),
    owned: tx('tx.lib.concept.original.plural'),
    inherited: tx('tx.lib.concept.inherited.plural')
  };

  return (
    <div className={cn('font-controls text-sm opacity-50 hover:opacity-100 transition-opacity select-none', className)}>
      <Select value={filter} onValueChange={newValue => setFilter(newValue!)} items={items}>
        <SelectTrigger noBorder className='h-8 pl-2 pr-0 gap-1'>
          <SelectValue placeholder={tx('tx.general.filter')} />
        </SelectTrigger>
        <SelectContent align='start'>
          <SelectItem value='all'>
            <IconFilter className='text-muted-foreground' />
            {tx('tx.general.filter')}
          </SelectItem>
          <SelectItem value='schema_issues' title={tx('ui.filter.schemaIssuesTitle')}>
            <IconStatusError className='text-destructive' />
            {tx('ui.filter.schemaIssuesShort')}
          </SelectItem>
          {showModelFilter ? (
            <SelectItem value='model_issues' title={tx('ui.filter.modelIssuesTitle')}>
              <IconStatusIncalculable className='text-destructive' />
              {tx('ui.filter.modelIssuesShort')}
            </SelectItem>
          ) : null}
          <SelectItem value='crucial'>
            <IconCrucial className='text-constructive' />
            {tx('tx.lib.cst.crucial.plural')}
          </SelectItem>
          <SelectItem value='kernel'>
            <IconGraphCore className='text-primary' />
            {tx('tx.lib.concept.basic.plural')}
          </SelectItem>
          <SelectItem value='derived'>
            <IconGraphCore className='text-muted-foreground' />
            {tx('tx.lib.concept.derived.plural')}
          </SelectItem>
          <SelectItem value='owned'>
            <IconPredecessor className='text-constructive' />
            {tx('tx.lib.concept.original.plural')}
          </SelectItem>
          <SelectItem value='inherited'>
            <IconChild className='text-primary' />
            {tx('tx.lib.concept.inherited.plural')}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
