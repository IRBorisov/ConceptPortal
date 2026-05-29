'use client';

import clsx from 'clsx';

import { useTx } from '@/i18n';

import { IconSearch } from '@/components/icons';
import { Loader } from '@/components/loader';
import { type Styling } from '@/components/props';

import { cn } from '../utils';

interface SearchBarProps extends Styling {
  /** Id of the search bar. */
  id?: string;

  /** Search query. */
  query: string;

  /** Placeholder text. */
  placeholder?: string;

  /** Callback to be called when the search query changes. */
  onChangeQuery?: (newValue: string) => void;

  /** Disable search icon. */
  noIcon?: boolean;

  /** Disable border. */
  noBorder?: boolean;

  /** Show loader instead of the search icon. */
  loading?: boolean;

  /** Input ref object. */
  inputRef?: React.Ref<HTMLInputElement>;
}

/**
 * Displays a search bar with a search icon and text input.
 */
export function SearchBar({
  id,
  query,
  noIcon,
  onChangeQuery,
  noBorder,
  loading,
  className,
  placeholder,
  inputRef,
  ...restProps
}: SearchBarProps) {
  const tx = useTx();
  const resolvedPlaceholder = placeholder ?? tx('tx.general.search');

  return (
    <div className={cn('group relative flex items-center grow', className)} {...restProps}>
      {!noIcon ? (
        loading ? (
          <span
            className={clsx(
              'absolute -top-0.5 left-2 translate-y-1/2',
              'pointer-events-none',
              'text-muted-foreground group-focus-within:text-primary'
            )}
            aria-hidden
          >
            <Loader variant='ring' scale={1} />
          </span>
        ) : (
          <IconSearch
            className={clsx(
              'absolute -top-0.5 left-2 translate-y-1/2',
              'pointer-events-none ',
              'bg-transparent text-muted-foreground',
              'group-focus-within:text-primary'
            )}
            size='1.25rem'
          />
        )
      ) : null}
      <input
        id={id}
        ref={inputRef}
        type='search'
        className={clsx(
          'min-w-0 py-2 w-full pr-2',
          'leading-tight truncate hover:text-clip',
          'bg-transparent',
          !noIcon && 'pl-8',
          !noBorder && 'border px-3'
        )}
        value={query}
        onChange={event => onChangeQuery?.(event.target.value)}
        placeholder={resolvedPlaceholder}
        aria-busy={loading}
      />
    </div>
  );
}
