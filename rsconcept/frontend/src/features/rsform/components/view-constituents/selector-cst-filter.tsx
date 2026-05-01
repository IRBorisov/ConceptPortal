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
          <SelectValue placeholder={tx('ui.filter.placeholder', 'Filter')} />
        </SelectTrigger>
        <SelectContent align='start'>
          <SelectItem value='all'>
            <IconFilter size='1rem' className='text-muted-foreground -mt-0.5 -mr-0.75' />
            {tx('ui.filter.placeholder', 'Filter')}
          </SelectItem>
          <SelectItem value='schema_issues' title={tx('ui.filter.schemaIssuesTitle', 'Schema issues')}>
            <IconStatusError size='1rem' className='text-destructive -mt-0.5 -mr-0.75' />
            {tx('ui.filter.schemaIssuesShort', 'Sch. issues')}
          </SelectItem>
          {showModelFilter ? (
            <SelectItem value='model_issues' title={tx('ui.filter.modelIssuesTitle', 'Model issues')}>
              <IconStatusIncalculable size='1rem' className='text-destructive -mt-0.5 -mr-0.75' />
              {tx('ui.filter.modelIssuesShort', 'Mdl. issues')}
            </SelectItem>
          ) : null}
          <SelectItem value='crucial'>
            <IconCrucial size='1rem' className='text-constructive -mt-0.5 -mr-0.75' />
            {tx('ui.filter.crucial', 'Crucial')}
          </SelectItem>
          <SelectItem value='kernel'>
            <IconGraphCore size='1rem' className='text-primary -mt-0.5 -mr-0.75' />
            {tx('ui.filter.basic', 'Basic')}
          </SelectItem>
          <SelectItem value='derived'>
            <IconGraphCore size='1rem' className='text-muted-foreground -mt-0.5 -mr-0.75' />
            {tx('ui.filter.derived', 'Derived')}
          </SelectItem>
          <SelectItem value='owned'>
            <IconPredecessor size='1rem' className='text-constructive -mt-0.5 -mr-0.75' />
            {tx('ui.filter.owned', 'Owned')}
          </SelectItem>
          <SelectItem value='inherited'>
            <IconChild size='1rem' className='text-primary -mt-0.5 -mr-0.75' />
            {tx('ui.filter.inheritedDescendants', 'Descendants')}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
