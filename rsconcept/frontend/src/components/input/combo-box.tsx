'use client';

import { useRef, useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';

import { IconRemove } from '../icons';
import { type Styling } from '../props';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '../utils';

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

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen && triggerRef.current) {
      setPopoverWidth(triggerRef.current.offsetWidth);
    }
  }

  function handleChangeValue(newValue: Option | null) {
    onChange(newValue);
    setOpen(false);
  }

  function handleClear(event: React.MouseEvent<SVGElement>) {
    event.stopPropagation();
    handleChangeValue(null);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          id={id}
          ref={triggerRef}
          role='combobox'
          aria-expanded={open}
          className={cn(
            'relative h-9',
            'flex gap-2 px-3 py-2 items-center justify-between',
            'bg-input disabled:opacity-50',
            'cursor-pointer disabled:cursor-auto',
            'whitespace-nowrap',
            'focus-outline',
            "[&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
            open && 'cursor-auto',
            !noBorder && 'border',
            noBorder && 'rounded-md',
            !value && 'text-muted-foreground',
            className
          )}
          style={style}
          hidden={hidden && !open}
        >
          <span className='truncate'>{value ? labelValueFunc(value) : placeholder}</span>
          <ChevronDownIcon className={cn('text-muted-foreground', clearable && !!value && 'opacity-0')} />
          {clearable && !!value ? (
            <IconRemove
              tabIndex={-1}
              size='1rem'
              className='cc-remove absolute pointer-events-auto right-3'
              onClick={handleClear}
            />
          ) : null}
        </button>
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
