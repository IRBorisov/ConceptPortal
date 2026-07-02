'use client';

import { useRef, useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';

import { useTx } from '@/i18n';

import { IconRemove } from '../icons';
import { type Styling } from '../props';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '../utils';

interface ComboMultiPropsBase<Option> extends Styling {
  /** Id of the trigger button. */
  id?: string;

  /** Options available for selection. */
  items?: Option[];

  /** Currently selected options. */
  value: Option[];

  /** Stable string key for each option. */
  idFunc: (item: Option) => string;

  /** Label shown on each selected chip in the trigger. */
  labelValueFunc: (item: Option) => string;

  /** Label shown for each option in the dropdown list. */
  labelOptionFunc: (item: Option) => string;

  /** Disables interaction with the control. */
  disabled?: boolean;

  /** Placeholder text when no values are selected. */
  placeholder?: string;

  /** Disables the search input inside the dropdown. */
  noSearch?: boolean;
}

interface ComboMultiPropsFull<Option> extends ComboMultiPropsBase<Option> {
  /** Called with the full selection array on add, remove, or clear. */
  onChange: (newValue: Option[]) => void;
}

interface ComboMultiPropsSplit<Option> extends ComboMultiPropsBase<Option> {
  /** Called when all selections are cleared. */
  onClear: () => void;

  /** Called when an option is added to the selection. */
  onAdd: (item: Option) => void;

  /** Called when an option is removed from the selection. */
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
  const tx = useTx();
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
      } else if ('onChange' in restProps && typeof restProps.onChange === 'function') {
        restProps.onChange([...value, newValue]);
      } else {
        throw new Error('onChange is not defined');
      }
      setOpen(false);
    }
  }

  function handleRemoveValue(delValue: Option) {
    if ('onRemove' in restProps && typeof restProps.onRemove === 'function') {
      restProps.onRemove(delValue);
    } else if ('onChange' in restProps && typeof restProps.onChange === 'function') {
      restProps.onChange(value.filter(v => v !== delValue));
    } else {
      throw new Error('onChange is not defined');
    }
    setOpen(false);
  }

  function handleClear(event: React.MouseEvent<SVGElement>) {
    event.stopPropagation();
    if ('onClear' in restProps && typeof restProps.onClear === 'function') {
      restProps.onClear();
    } else if ('onChange' in restProps && typeof restProps.onChange === 'function') {
      restProps.onChange([]);
    } else {
      throw new Error('onChange is not defined');
    }
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <button
            type='button'
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
        }
      />
      <PopoverContent sideOffset={-1} className='p-0' style={{ width: popoverWidth }}>
        <Command>
          {!noSearch ? <CommandInput placeholder={tx('tx.general.search') + '...'} className='h-9' /> : null}
          <CommandList>
            <CommandEmpty>{tx('tx.list.empty')}</CommandEmpty>
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
