'use client';

import { useEffect } from 'react';

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

import { useCstSearchStore } from '../../stores/cst-search';

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

  return (
    <div className={cn('font-controls text-sm opacity-50 hover:opacity-100 transition-opacity select-none', className)}>
      <Select value={filter} onValueChange={setFilter}>
        <SelectTrigger noBorder className='h-8 pl-2 pr-0 gap-1'>
          <SelectValue placeholder={tx('ui.filter.placeholder')} />
        </SelectTrigger>
        <SelectContent align='start'>
          <SelectItem value='all'>
            <IconFilter size='1rem' className='text-muted-foreground -mt-0.5 -mr-0.75' />
            {tx('ui.filter.placeholder')}
          </SelectItem>
          <SelectItem value='schema_issues' title={tx('ui.filter.schemaIssuesTitle')}>
            <IconStatusError size='1rem' className='text-destructive -mt-0.5 -mr-0.75' />
            {tx('ui.filter.schemaIssuesShort')}
          </SelectItem>
          {showModelFilter ? (
            <SelectItem value='model_issues' title={tx('ui.filter.modelIssuesTitle')}>
              <IconStatusIncalculable size='1rem' className='text-destructive -mt-0.5 -mr-0.75' />
              {tx('ui.filter.modelIssuesShort')}
            </SelectItem>
          ) : null}
          <SelectItem value='crucial'>
            <IconCrucial size='1rem' className='text-constructive -mt-0.5 -mr-0.75' />
            {tx('ui.filter.crucial')}
          </SelectItem>
          <SelectItem value='kernel'>
            <IconGraphCore size='1rem' className='text-primary -mt-0.5 -mr-0.75' />
            {tx('ui.filter.basic')}
          </SelectItem>
          <SelectItem value='derived'>
            <IconGraphCore size='1rem' className='text-muted-foreground -mt-0.5 -mr-0.75' />
            {tx('ui.filter.derived')}
          </SelectItem>
          <SelectItem value='owned'>
            <IconPredecessor size='1rem' className='text-constructive -mt-0.5 -mr-0.75' />
            {tx('ui.filter.owned')}
          </SelectItem>
          <SelectItem value='inherited'>
            <IconChild size='1rem' className='text-primary -mt-0.5 -mr-0.75' />
            {tx('ui.filter.inheritedDescendants')}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
