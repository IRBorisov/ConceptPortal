'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

import { MiniButton } from '../control';
import { IconRemove } from '../icons';
import { type Styling } from '../props';

import { Button } from './button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface ComboBoxProps<Option> extends Styling {
  id?: string;
  items?: Option[];
  value: Option | null;
  onChange: (newValue: Option | null) => void;

  idFunc: (item: Option) => string;
  labelValueFunc: (item: Option) => string;
  labelOptionFunc: (item: Option) => string;

  placeholder?: string;
  hidden?: boolean;
  noBorder?: boolean;
  clearable?: boolean;
  noSearch?: boolean;
}

/**
 * Displays a combo-select component.
 */
export function ComboBox<Option>({
  id,
  items,
  value,
  onChange,
  labelValueFunc,
  labelOptionFunc,
  idFunc,
  noBorder,
  placeholder,
  className,
  style,
  hidden,
  clearable,
  noSearch
}: ComboBoxProps<Option>) {
  const [open, setOpen] = useState(false);
  const [popoverWidth, setPopoverWidth] = useState<number | undefined>(undefined);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (triggerRef.current) {
      setPopoverWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  function handleChangeValue(newValue: Option | null) {
    onChange(newValue);
    setOpen(false);
  }

  function handleClear(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    handleChangeValue(null);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          ref={triggerRef}
          variant='ghost'
          role='combobox'
          aria-expanded={open}
          className={cn(
            'relative justify-between font-normal bg-input hover:bg-input',
            open && 'cursor-auto',
            !noBorder && 'border',
            noBorder && 'rounded-md',
            !value && 'text-muted-foreground hover:text-muted-foreground',
            className
          )}
          style={style}
          hidden={hidden && !open}
        >
          <span className='truncate'>{value ? labelValueFunc(value) : placeholder}</span>
          <ChevronDownIcon className={cn('text-muted-foreground', clearable && !!value && 'opacity-0')} />
          {clearable && !!value ? (
            <MiniButton
              noHover
              title='Очистить'
              aria-label='Очистить'
              className='absolute right-2 text-muted-foreground hover:text-warn-600'
              icon={<IconRemove size='1rem' />}
              onClick={handleClear}
            />
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent sideOffset={-1} className='p-0' style={{ width: popoverWidth }}>
        <Command>
          {!noSearch ? <CommandInput placeholder='Поиск...' className='h-9' /> : null}
          <CommandList>
            <CommandEmpty>Список пуст</CommandEmpty>
            <CommandGroup>
              {items?.map(item => (
                <CommandItem
                  key={idFunc(item)}
                  value={labelOptionFunc(item)}
                  onSelect={() => handleChangeValue(item)}
                  className={cn(value === item && 'bg-selected text-selected-foreground')}
                >
                  {labelOptionFunc(item)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
