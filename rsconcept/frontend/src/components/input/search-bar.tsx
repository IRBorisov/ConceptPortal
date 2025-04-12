import clsx from 'clsx';

import { IconSearch } from '@/components/icons';
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
  className,
  placeholder = 'Поиск',
  ...restProps
}: SearchBarProps) {
  return (
    <div className={cn('relative flex items-center grow', className)} {...restProps}>
      {!noIcon ? (
        <IconSearch className='absolute -top-0.5 left-2 translate-y-1/2 cc-search-icon' size='1.25rem' />
      ) : null}
      <input
        id={id}
        type='search'
        className={clsx(
          'min-w-0 py-2',
          'leading-tight truncate hover:text-clip',
          'bg-transparent',
          !noIcon && 'pl-8',
          !noBorder && 'border px-3'
        )}
        value={query}
        onChange={event => onChangeQuery?.(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
