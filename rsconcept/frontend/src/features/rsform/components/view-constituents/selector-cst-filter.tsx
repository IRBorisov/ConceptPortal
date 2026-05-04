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
    all: tx('semantic.term.filter'),
    schema_issues: tx('ui.filter.schemaIssuesShort'),
    model_issues: tx('ui.filter.modelIssuesShort'),
    crucial: tx('ui.filter.crucial'),
    kernel: tx('ui.filter.basic'),
    derived: tx('ui.filter.derived'),
    owned: tx('ui.filter.owned'),
    inherited: tx('ui.filter.inheritedDescendants')
  };

  return (
    <div className={cn('font-controls text-sm opacity-50 hover:opacity-100 transition-opacity select-none', className)}>
      <Select value={filter} onValueChange={newValue => setFilter(newValue!)} items={items}>
        <SelectTrigger noBorder className='h-8 pl-2 pr-0 gap-1'>
          <SelectValue placeholder={tx('semantic.term.filter')} />
        </SelectTrigger>
        <SelectContent align='start'>
          <SelectItem value='all'>
            <IconFilter className='text-muted-foreground' />
            {tx('semantic.term.filter')}
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
            {tx('ui.filter.crucial')}
          </SelectItem>
          <SelectItem value='kernel'>
            <IconGraphCore className='text-primary' />
            {tx('ui.filter.basic')}
          </SelectItem>
          <SelectItem value='derived'>
            <IconGraphCore className='text-muted-foreground' />
            {tx('ui.filter.derived')}
          </SelectItem>
          <SelectItem value='owned'>
            <IconPredecessor className='text-constructive' />
            {tx('ui.filter.owned')}
          </SelectItem>
          <SelectItem value='inherited'>
            <IconChild className='text-primary' />
            {tx('ui.filter.inheritedDescendants')}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
