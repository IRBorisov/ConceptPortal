'use client';

import { type ReactNode } from 'react';

import { useTx } from '@/i18n';

import { IconEditor, IconFilter, IconHide, IconOSS, IconOwner, IconRSForm, IconRSModel } from '@/components/icons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/input/select';
import { cn } from '@/components/utils';

import { type LibrarySearchSelectorFilter, useLibrarySearchStore } from '../../stores/library-search';

interface SelectorLibraryFilterProps {
  className?: string;
}

export function SelectorLibraryFilter({ className }: SelectorLibraryFilterProps) {
  const tx = useTx();
  const value = useLibrarySearchStore(state => state.selectorFilter);
  const setSelectorFilter = useLibrarySearchStore(state => state.setSelectorFilter);

  function handleValueChange(next: unknown) {
    setSelectorFilter(next as LibrarySearchSelectorFilter);
  }

  const items: Record<LibrarySearchSelectorFilter, ReactNode> = {
    all: tx('tx.general.filter'),
    owner_me: tx('tx.lib.filter.byOwnerMe'),
    editor_me: tx('tx.lib.filter.byEditorMe'),
    hidden: tx('tx.lib.filter.byHidden'),
    type_rsform: tx('tx.schema.short'),
    type_oss: tx('tx.oss.short'),
    type_rsmodel: tx('tx.model.short')
  };

  return (
    <div className={cn('font-controls text-sm opacity-80 transition-opacity hover:opacity-100 select-none', className)}>
      <Select value={value} onValueChange={handleValueChange} items={items}>
        <SelectTrigger noBorder className='h-7 pl-2 pr-1 gap-1 pb-0'>
          <SelectValue placeholder={tx('tx.general.filter')} />
        </SelectTrigger>
        <SelectContent align='start'>
          <SelectItem value='all'>
            <IconFilter className='text-muted-foreground' />
            {tx('tx.general.filter')}
          </SelectItem>
          <SelectItem value='owner_me'>
            <IconOwner className='text-primary' />
            {tx('tx.lib.filter.byOwnerMe')}
          </SelectItem>
          <SelectItem value='editor_me'>
            <IconEditor className='text-primary' />
            {tx('tx.lib.filter.byEditorMe')}
          </SelectItem>
          <SelectItem value='hidden'>
            <IconHide className='text-destructive' />
            {tx('tx.lib.filter.byHidden')}
          </SelectItem>
          <SelectItem value='type_rsform'>
            <IconRSForm className='text-primary' />
            {tx('tx.schema.short')}
          </SelectItem>
          <SelectItem value='type_oss'>
            <IconOSS className='text-constructive' />
            {tx('tx.oss.short')}
          </SelectItem>
          <SelectItem value='type_rsmodel'>
            <IconRSModel className='text-accent-orange' />
            {tx('tx.model.short')}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
