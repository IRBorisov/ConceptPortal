'use client';

import assert from 'assert';

import { useRef, useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';

import { IconRemove } from '../icons';
import { type Styling } from '../props';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '../utils';

interface ComboMultiPropsBase<Option> extends Styling {
  id?: string;
  items?: Option[];
  value: Option[];

  idFunc: (item: Option) => string;
  labelValueFunc: (item: Option) => string;
  labelOptionFunc: (item: Option) => string;

  disabled?: boolean;
  placeholder?: string;
  noSearch?: boolean;
}

interface ComboMultiPropsFull<Option> extends ComboMultiPropsBase<Option> {
  onChange: (newValue: Option[]) => void;
}

interface ComboMultiPropsSplit<Option> extends ComboMultiPropsBase<Option> {
  onClear: () => void;
  onAdd: (item: Option) => void;
  onRemove: (item: Option) => void;
}

type ComboMultiProps<Option> = ComboMultiPropsFull<Option> | ComboMultiPropsSplit<Option>;

/**
 * Displays a combo-box component with multiple selection.
 */
export function ComboMulti<Option>({
  id,
  items,
  value,
  labelValueFunc,
  labelOptionFunc,
  idFunc,
  placeholder,
  className,
  style,
  disabled,
  noSearch,
  ...restProps
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
      if ('onAdd' in restProps && typeof restProps.onAdd === 'function') {
        restProps.onAdd(newValue);
      } else {
        assert('onChange' in restProps);
        restProps.onChange([...value, newValue]);
      }
      setOpen(false);
    }
  }

  function handleRemoveValue(delValue: Option) {
    if ('onRemove' in restProps && typeof restProps.onRemove === 'function') {
      restProps.onRemove(delValue);
    } else {
      assert('onChange' in restProps);
      restProps.onChange(value.filter(v => v !== delValue));
    }
    setOpen(false);
  }

  function handleClear(event: React.MouseEvent<SVGElement>) {
    event.stopPropagation();
    if ('onClear' in restProps && typeof restProps.onClear === 'function') {
      restProps.onClear();
    } else {
      assert('onChange' in restProps);
      restProps.onChange([]);
    }
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
            'bg-input disabled:bg-transparent',
            'cursor-pointer disabled:cursor-auto',
            'whitespace-nowrap',
            'focus-outline border',
            "[&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
            open && 'cursor-auto',
            !value && 'text-muted-foreground',
            className
          )}
          style={style}
          disabled={disabled}
        >
          <div className='flex flex-wrap gap-2 items-center'>
            {value.length === 0 ? <div className='text-muted-foreground'>{placeholder}</div> : null}
            {value.map(item => (
              <div key={idFunc(item)} className='flex px-1 items-center border rounded-lg bg-accent text-sm'>
                {labelValueFunc(item)}
                {!disabled ? (
                  <IconRemove
                    tabIndex={-1}
                    size='1rem'
                    className='cc-remove cc-hover-pulse'
                    onClick={
                      disabled
                        ? undefined
                        : event => {
                            event.stopPropagation();
                            handleRemoveValue(item);
                          }
                    }
                  />
                ) : null}
              </div>
            ))}
          </div>

          <ChevronDownIcon className={cn('text-muted-foreground', !!value && 'opacity-0')} />
          {!!value && !disabled ? (
            <IconRemove
              tabIndex={-1}
              size='1rem'
              className='cc-remove absolute pointer-events-auto right-3 cc-hover-pulse hover:text-primary'
              onClick={value.length === 0 ? undefined : handleClear}
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
              {items
                ?.filter(item => !value.includes(item))
                .map(item => (
                  <CommandItem
                    key={idFunc(item)}
                    value={labelOptionFunc(item)}
                    onSelect={() => handleAddValue(item)}
                    disabled={disabled}
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
