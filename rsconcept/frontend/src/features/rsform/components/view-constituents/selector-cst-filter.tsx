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
        <SelectTrigger noBorder className='h-8 pl-2 pr-0'>
          <SelectValue placeholder='Фильтр' />
        </SelectTrigger>
        <SelectContent align='start'>
          <SelectItem value='all'>
            <IconFilter size='1rem' className='text-muted-foreground' />
            Фильтр
          </SelectItem>
          <SelectItem value='problematic'>
            <IconStatusError size='1rem' className='text-destructive' />
            Проблемные
          </SelectItem>
          <SelectItem value='crucial'>
            <IconCrucial size='1rem' className='text-constructive' />
            Ключевые
          </SelectItem>
          <SelectItem value='kernel'>
            <IconGraphCore size='1rem' className='text-primary' />
            Базовые
          </SelectItem>
          <SelectItem value='derived'>
            <IconGraphCore size='1rem' className='text-muted-foreground' />
            Производные
          </SelectItem>
          <SelectItem value='owned'>
            <IconPredecessor size='1rem' className='text-constructive' />
            Собственные
          </SelectItem>
          <SelectItem value='inherited'>
            <IconChild size='1rem' className='text-primary' />
            Наследники
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
