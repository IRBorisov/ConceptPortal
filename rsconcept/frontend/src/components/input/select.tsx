'use client';

import { Select as SelectPrimitive } from '@base-ui/react/select';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import { globalIDs } from '@/utils/constants';

import { cn } from '../utils';

const Select = SelectPrimitive.Root;

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value data-slot='select-value' className={cn('flex flex-1 text-left', className)} {...props} />
  );
}

function SelectTrigger({
  className,
  children,
  noBorder,
  ...props
}: SelectPrimitive.Trigger.Props & {
  noBorder?: boolean;
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot='select-trigger'
      className={cn(
        'h-9 w-fit',
        'flex gap-2 px-3 items-center justify-between',
        'bg-input disabled:bg-transparent',
        'cursor-pointer disabled:cursor-auto',
        'whitespace-nowrap',
        'focus-outline',
        'data-placeholder:text-muted-foreground',
        '**:data-[slot=select-value]:min-w-0 **:data-[slot=select-value]:flex-1 **:data-[slot=select-value]:truncate **:data-[slot=select-value]:text-left',
        !noBorder && 'border',
        noBorder && 'rounded-md',
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={<ChevronDownIcon className='size-4 shrink-0 cc-hover-pulse hover:text-primary' />}
      />
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  align = 'center',
  alignOffset,
  side,
  sideOffset = 4,
  alignItemWithTrigger = false,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<SelectPrimitive.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset' | 'alignItemWithTrigger'>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className='isolate z-topmost'
      >
        <SelectPrimitive.Popup
          data-slot='select-content'
          className={cn(
            'relative max-h-(--available-height) min-w-[max(8rem,var(--anchor-width))]',
            'bg-popover text-sm text-popover-foreground',
            'border shadow-md',
            'overflow-x-hidden overflow-y-auto',
            'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 duration-dropdown',
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
            className
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List className='p-1'>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot='select-label'
      className={cn('text-muted-foreground px-2 py-1.5', className)}
      {...props}
    />
  );
}

function SelectItem({ className, children, title, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot='select-item'
      className={cn(
        'relative w-full',
        'flex flex-nowrap items-center gap-2',
        'py-1 px-2',
        'cursor-default rounded-sm select-none',
        'data-disabled:pointer-events-none data-disabled:opacity-50',
        'outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground',
        'data-selected:not-[:hover]:bg-selected data-selected:not-[:hover]:text-selected-foreground',
        "[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      data-tooltip-id={title ? globalIDs.tooltip : undefined}
      data-tooltip-content={title}
      {...props}
    >
      {children}
    </SelectPrimitive.Item>
  );
}

function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot='select-scroll-up-button'
      className={cn('flex cursor-default items-center justify-center py-1', className)}
      {...props}
    >
      <ChevronUpIcon className='size-4' />
    </SelectPrimitive.ScrollUpArrow>
  );
}

function SelectScrollDownButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot='select-scroll-down-button'
      className={cn('flex cursor-default items-center justify-center py-1', className)}
      {...props}
    >
      <ChevronDownIcon className='size-4' />
    </SelectPrimitive.ScrollDownArrow>
  );
}

export { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue };
