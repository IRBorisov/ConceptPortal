'use client';

import { createContext, useContext, useEffect, useId, useMemo, useState } from 'react';
import { SearchIcon } from 'lucide-react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { cn } from '../utils';

interface CommandContextValue {
  query: string;
  setQuery: (value: string) => void;
  registerItem: (id: string, visible: boolean) => void;
  unregisterItem: (id: string) => void;
  hasVisibleItems: boolean;
}

const CommandContext = createContext<CommandContextValue | null>(null);

function useCommandContext(componentName: string) {
  const context = useContext(CommandContext);
  if (!context) {
    throw new Error(`${componentName} must be used within Command`);
  }
  return context;
}

/** Searchable command list root; provides query state to child items. */
function Command({ className, ...props }: React.ComponentProps<'div'>) {
  const [query, setQuery] = useState('');
  const [visibilityMap, setVisibilityMap] = useState<Record<string, boolean>>({});

  function registerItem(id: string, visible: boolean) {
    setVisibilityMap(previous => {
      if (previous[id] === visible) {
        return previous;
      }
      return { ...previous, [id]: visible };
    });
  }

  function unregisterItem(id: string) {
    setVisibilityMap(previous => {
      if (!(id in previous)) {
        return previous;
      }
      const next = { ...previous };
      delete next[id];
      return next;
    });
  }

  const hasVisibleItems = useMemo(() => Object.values(visibilityMap).some(Boolean), [visibilityMap]);

  const contextValue = useMemo(
    () => ({
      query,
      setQuery,
      registerItem,
      unregisterItem,
      hasVisibleItems
    }),
    [query, hasVisibleItems]
  );

  return (
    <CommandContext.Provider value={contextValue}>
      <div
        data-slot='command'
        className={cn(
          'bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md',
          className
        )}
        {...props}
      />
    </CommandContext.Provider>
  );
}

type CommandDialogProps = React.ComponentProps<typeof Dialog> & {
  /** Accessible title for the command palette dialog. */
  title?: string;

  /** Accessible description for the command palette dialog. */
  description?: string;
};

/** Full-screen command palette rendered inside a {@link Dialog}. */
function CommandDialog({
  title = 'Command Palette',
  description = 'Search for a command to run...',
  children,
  ...props
}: CommandDialogProps) {
  return (
    <Dialog {...props}>
      <DialogHeader className='sr-only'>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent className='overflow-hidden p-0'>
        <Command className='**:[[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 **:[[cmdk-input]]:h-12 **:[[cmdk-item]]:px-2 **:[[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5'>
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

type CommandInputProps = Omit<React.ComponentProps<'input'>, 'onChange'> & {
  /** Called when the search query changes. */
  onValueChange?: (value: string) => void;
};

/** Search input wired to the parent {@link Command} query state. */
function CommandInput({ className, onValueChange, value, defaultValue, ...props }: CommandInputProps) {
  const { query, setQuery } = useCommandContext('CommandInput');

  const resolvedValue = typeof value === 'string' ? value : query;

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextValue = event.currentTarget.value;
    setQuery(nextValue);
    onValueChange?.(nextValue);
  }

  return (
    <div data-slot='command-input-wrapper' className='flex h-9 items-center gap-2 border-b px-3'>
      <SearchIcon className='size-4 shrink-0 opacity-50' />
      <input
        data-slot='command-input'
        className={cn(
          'placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        value={resolvedValue}
        defaultValue={defaultValue}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
}

/** Scrollable list container for {@link CommandItem} children. */
function CommandList({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='command-list'
      className={cn('max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto', className)}
      {...props}
    />
  );
}

/** Placeholder shown when no {@link CommandItem} matches the current query. */
function CommandEmpty({ className, ...props }: React.ComponentProps<'div'>) {
  const { hasVisibleItems } = useCommandContext('CommandEmpty');
  if (hasVisibleItems) {
    return null;
  }
  return <div data-slot='command-empty' className={cn('py-6 text-center text-sm', className)} {...props} />;
}

/** Visual group of related {@link CommandItem} options. */
function CommandGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='command-group'
      className={cn(
        'text-foreground **:[[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium',
        className
      )}
      {...props}
    />
  );
}

/** Horizontal rule separating command groups. */
function CommandSeparator({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='command-separator' className={cn('bg-border -mx-1 h-px', className)} {...props} />;
}

type CommandItemProps = Omit<React.ComponentProps<'button'>, 'value' | 'onSelect'> & {
  /** Text used for client-side filtering against the command query. */
  value?: string;

  /** Called when the item is selected (clicked or activated). */
  onSelect?: (value: string) => void;
};

/** Selectable command entry; hidden when it does not match the query. */
function CommandItem({ className, value, disabled, onSelect, onClick, children, ...props }: CommandItemProps) {
  const { query, registerItem, unregisterItem } = useCommandContext('CommandItem');
  const itemId = useId();
  const itemValue = (value ?? '').toLowerCase();
  const normalizedQuery = query.trim().toLowerCase();
  const isVisible = !normalizedQuery || itemValue.includes(normalizedQuery);

  useEffect(() => {
    registerItem(itemId, isVisible);
    return function cleanup() {
      unregisterItem(itemId);
    };
  }, [itemId, isVisible, registerItem, unregisterItem]);

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (disabled) {
      return;
    }
    onClick?.(event);
    onSelect?.(value ?? '');
  }

  if (!isVisible) {
    return null;
  }

  return (
    <button
      type='button'
      data-slot='command-item'
      data-disabled={disabled ? true : undefined}
      className={cn(
        "[&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 hover:bg-accent hover:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

/** Keyboard shortcut hint displayed at the end of a {@link CommandItem}. */
function CommandShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='command-shortcut'
      className={cn('text-muted-foreground ml-auto text-xs tracking-widest', className)}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
};
