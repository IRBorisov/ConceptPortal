'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot='select' {...props} />;
}

function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot='select-group' {...props} />;
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot='select-value' {...props} />;
}

function SelectTrigger({
  className,
  size = 'default',
  children,
  noBorder,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  noBorder?: boolean;
  size?: 'sm' | 'default';
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot='select-trigger'
      data-size={size}
      className={cn(
        'data-[size=default]:h-9 data-[size=sm]:h-8',
        'flex items-center justify-between gap-2 px-3 py-2',
        'bg-input disabled:opacity-50',
        'cursor-pointer disabled:cursor-auto',
        'data-[placeholder]:text-muted-foreground',
        'whitespace-nowrap',
        'outline-none focus-visible:ring-[2px] focus-visible:border-ring focus-visible:ring-ring aria-invalid:ring-destructive',
        '*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2',
        "[&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        !noBorder && 'border aria-invalid:border-destructive',
        noBorder && 'rounded-md',
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className='size-4' />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot='select-content'
        className={cn(
          'z-topmost relative max-h-(--radix-select-content-available-height) min-w-32',
          'bg-popover text-sm text-popover-foreground',
          'border shadow-md',
          'overflow-x-hidden overflow-y-auto',
          'cc-animate-popover',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'p-1',
            position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1'
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot='select-label'
      className={cn('text-muted-foreground px-2 py-1.5', className)}
      {...props}
    />
  );
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot='select-item'
      className={cn(
        'relative',
        'flex py-1 pr-8 pl-2 items-center gap-2',
        'cursor-default rounded-sm select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        'outline-none focus:bg-accent focus:text-accent-foreground',
        '*:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2',
        "[&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "data-[state='checked']:not-[:hover]:bg-selected data-[state='checked']:not-[:hover]:text-selected-foreground",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot='select-separator'
      className={cn('bg-border pointer-events-none -mx-1 my-1 h-px', className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot='select-scroll-up-button'
      className={cn('flex cursor-default items-center justify-center py-1', className)}
      {...props}
    >
      <ChevronUpIcon className='size-4' />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot='select-scroll-down-button'
      className={cn('flex cursor-default items-center justify-center py-1', className)}
      {...props}
    >
      <ChevronDownIcon className='size-4' />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue
};
