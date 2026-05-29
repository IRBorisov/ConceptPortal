'use client';

import { useTx } from '@/i18n';

import { IconSearch, IconText } from '@/components/icons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/input/select';
import { cn } from '@/components/utils';

import { type LibrarySearchMode } from '../../models/library-filter';
import { useLibrarySearchStore } from '../../stores/library-search';

interface SelectorSearchModeProps {
  className?: string;
}

export function SelectorSearchMode({ className }: SelectorSearchModeProps) {
  const tx = useTx();
  const value = useLibrarySearchStore(state => state.searchMode);
  const setSearchMode = useLibrarySearchStore(state => state.setSearchMode);

  function handleValueChange(next: unknown) {
    setSearchMode(next as LibrarySearchMode);
  }

  const items: Record<LibrarySearchMode, string> = {
    metadata: tx('tx.lib.search.mode.metadata'),
    context: tx('tx.lib.contents')
  };

  return (
    <div className={cn('font-controls text-sm opacity-80 transition-opacity hover:opacity-100 select-none', className)}>
      <Select value={value} onValueChange={handleValueChange} items={items}>
        <SelectTrigger noBorder className='h-7 pl-2 pr-1 gap-1 pb-0 max-w-44'>
          <SelectValue placeholder={tx('tx.lib.search.mode.metadata')} />
        </SelectTrigger>
        <SelectContent align='start'>
          <SelectItem value='metadata'>
            <IconSearch className='text-muted-foreground' />
            {tx('tx.lib.search.mode.metadata')}
          </SelectItem>
          <SelectItem value='context'>
            <IconText className='text-primary' />
            {tx('tx.lib.search.mode.context')}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
