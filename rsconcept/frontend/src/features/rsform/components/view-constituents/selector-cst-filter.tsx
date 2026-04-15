'use client';

import {
  IconChild,
  IconCrucial,
  IconFilter,
  IconGraphCore,
  IconPredecessor,
  IconStatusError
} from '@/components/icons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/input/select';
import { cn } from '@/components/utils';

import { useCstSearchStore } from '../../stores/cst-search';

interface SelectorCstFilterProps {
  className?: string;
}

export function SelectorCstFilter({ className }: SelectorCstFilterProps) {
  const setFilter = useCstSearchStore(state => state.setFilter);
  const filter = useCstSearchStore(state => state.filter);

  return (
    <div className={cn('font-controls text-sm opacity-50 hover:opacity-100 transition-opacity select-none', className)}>
      <Select value={filter} onValueChange={setFilter}>
        <SelectTrigger noBorder className='h-8 pl-2 pr-0 gap-1'>
          <SelectValue placeholder='Фильтр' />
        </SelectTrigger>
        <SelectContent align='start'>
          <SelectItem value='all'>
            <IconFilter size='1rem' className='text-muted-foreground -mt-0.5 -mr-0.75' />
            Фильтр
          </SelectItem>
          <SelectItem value='problematic'>
            <IconStatusError size='1rem' className='text-destructive -mt-0.5 -mr-0.75' />
            Проблемные
          </SelectItem>
          <SelectItem value='crucial'>
            <IconCrucial size='1rem' className='text-constructive -mt-0.5 -mr-0.75' />
            Ключевые
          </SelectItem>
          <SelectItem value='kernel'>
            <IconGraphCore size='1rem' className='text-primary -mt-0.5 -mr-0.75' />
            Базовые
          </SelectItem>
          <SelectItem value='derived'>
            <IconGraphCore size='1rem' className='text-muted-foreground -mt-0.5 -mr-0.75' />
            Производные
          </SelectItem>
          <SelectItem value='owned'>
            <IconPredecessor size='1rem' className='text-constructive -mt-0.5 -mr-0.75' />
            Собственные
          </SelectItem>
          <SelectItem value='inherited'>
            <IconChild size='1rem' className='text-primary -mt-0.5 -mr-0.75' />
            Наследники
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
