'use client';

import { IconEditor, IconFilter, IconHide, IconOSS, IconOwner, IconRSForm, IconRSModel } from '@/components/icons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/input/select';
import { cn } from '@/components/utils';

import { type LibrarySearchSelectorFilter, useLibrarySearchStore } from '../../stores/library-search';

interface SelectorLibraryFilterProps {
  className?: string;
}

export function SelectorLibraryFilter({ className }: SelectorLibraryFilterProps) {
  const value = useLibrarySearchStore(state => state.selectorFilter);
  const setSelectorFilter = useLibrarySearchStore(state => state.setSelectorFilter);

  function handleValueChange(next: string) {
    setSelectorFilter(next as LibrarySearchSelectorFilter);
  }

  return (
    <div className={cn('font-controls text-sm opacity-80 transition-opacity hover:opacity-100 select-none', className)}>
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger noBorder className='h-7 pl-2 pr-1 gap-1 pb-0'>
          <SelectValue placeholder='Фильтр' />
        </SelectTrigger>
        <SelectContent align='start'>
          <SelectItem value='all'>
            <IconFilter size='1rem' className='text-muted-foreground -mt-0.5 -mr-0.75' />
            Фильтр
          </SelectItem>
          <SelectItem value='owner_me'>
            <IconOwner size='1rem' className='text-primary -mt-0.5 -mr-0.75' />Я владелец
          </SelectItem>
          <SelectItem value='editor_me'>
            <IconEditor size='1rem' className='text-primary -mt-0.5 -mr-0.75' />Я редактор
          </SelectItem>
          <SelectItem value='hidden'>
            <IconHide size='1rem' className='text-destructive -mt-0.5 -mr-0.75' />
            Скрытые
          </SelectItem>
          <SelectItem value='type_rsform'>
            <IconRSForm size='1rem' className='text-primary -mt-0.5 -mr-0.75' />
            Схемы
          </SelectItem>
          <SelectItem value='type_oss'>
            <IconOSS size='1rem' className='text-constructive -mt-0.5 -mr-0.75' />
            ОСС
          </SelectItem>
          <SelectItem value='type_rsmodel'>
            <IconRSModel size='1rem' className='text-accent-orange -mt-0.5 -mr-0.75' />
            Модели
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
