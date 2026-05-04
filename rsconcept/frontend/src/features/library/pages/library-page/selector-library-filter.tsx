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
    all: tx('semantic.term.filter'),
    owner_me: tx('lib.filter.owner'),
    editor_me: tx('lib.filter.editor'),
    hidden: tx('lib.filter.hidden'),
    type_rsform: tx('semantic.term.schema.short'),
    type_oss: tx('semantic.term.oss.short'),
    type_rsmodel: tx('semantic.term.model.short')
  };

  return (
    <div className={cn('font-controls text-sm opacity-80 transition-opacity hover:opacity-100 select-none', className)}>
      <Select value={value} onValueChange={handleValueChange} items={items}>
        <SelectTrigger noBorder className='h-7 pl-2 pr-1 gap-1 pb-0'>
          <SelectValue placeholder={tx('semantic.term.filter')} />
        </SelectTrigger>
        <SelectContent align='start'>
          <SelectItem value='all'>
            <IconFilter className='text-muted-foreground' />
            {tx('semantic.term.filter')}
          </SelectItem>
          <SelectItem value='owner_me'>
            <IconOwner className='text-primary' />
            {tx('lib.filter.owner')}
          </SelectItem>
          <SelectItem value='editor_me'>
            <IconEditor className='text-primary' />
            {tx('lib.filter.editor')}
          </SelectItem>
          <SelectItem value='hidden'>
            <IconHide className='text-destructive' />
            {tx('lib.filter.hidden')}
          </SelectItem>
          <SelectItem value='type_rsform'>
            <IconRSForm className='text-primary' />
            {tx('semantic.term.schema.short')}
          </SelectItem>
          <SelectItem value='type_oss'>
            <IconOSS className='text-constructive' />
            {tx('semantic.term.oss.short')}
          </SelectItem>
          <SelectItem value='type_rsmodel'>
            <IconRSModel className='text-accent-orange' />
            {tx('semantic.term.model.short')}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
