'use client';

import { useRef, useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';

import { IconRemove } from '../icons';
import { type Styling } from '../props';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '../utils';

interface ComboMultiProps<Option> extends Styling {
  id?: string;
  items?: Option[];
  value: Option[];
  onChange: (newValue: Option[]) => void;

  idFunc: (item: Option) => string;
  labelValueFunc: (item: Option) => string;
  labelOptionFunc: (item: Option) => string;

  placeholder?: string;
  noSearch?: boolean;
}

/**
 * Displays a combo-box component with multiple selection.
 */
export function ComboMulti<Option>({
  id,
  items,
  value,
  onChange,
  labelValueFunc,
  labelOptionFunc,
  idFunc,
  placeholder,
  className,
  style,
  noSearch
}: ComboMultiProps<Option>) {
  const [open, setOpen] = useState(false);
  const [popoverWidth, setPopoverWidth] = useState<number | undefined>(undefined);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen && triggerRef.current) {
      setPopoverWidth(triggerRef.current.offsetWidth);
    }
  }

  function handleAddValue(newValue: Option) {
    if (value.includes(newValue)) {
      handleRemoveValue(newValue);
    } else {
      onChange([...value, newValue]);
      setOpen(false);
    }
  }

  function handleRemoveValue(delValue: Option) {
    onChange(value.filter(v => v !== delValue));
    setOpen(false);
  }

  function handleClear(event: React.MouseEvent<SVGElement>) {
    event.stopPropagation();
    onChange([]);
    setOpen(false);
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
            'focus-outline border',
            "[&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
            open && 'cursor-auto',
            !value && 'text-muted-foreground',
            className
          )}
          style={style}
        >
          <div className='flex flex-wrap gap-1 items-center'>
            {value.length === 0 ? <div className='text-muted-foreground'>{placeholder}</div> : null}
            {value.map(item => (
              <div key={idFunc(item)} className='flex px-1 items-center border rounded-lg bg-accent text-sm'>
                {labelValueFunc(item)}
                <IconRemove
                  tabIndex={-1}
                  size='1rem'
                  className='cc-remove'
                  onClick={event => {
                    event.stopPropagation();
                    handleRemoveValue(item);
                  }}
                />
              </div>
            ))}
          </div>

          <ChevronDownIcon className={cn('text-muted-foreground', !!value && 'opacity-0')} />
          {!!value ? (
            <IconRemove
              tabIndex={-1}
              size='1rem'
              className='cc-remove absolute pointer-events-auto right-3 cc-hover-pulse hover:text-primary'
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
                  onSelect={() => handleAddValue(item)}
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
