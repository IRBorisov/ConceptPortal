import clsx from 'clsx';

import { IconSearch } from '@/components/icons';
import { type Styling } from '@/components/props';

import { TextInput } from './text-input';

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
    <div className={clsx('relative flex items-center', className)} {...restProps}>
      {!noIcon ? (
        <IconSearch
          className='absolute -top-0.5 left-2 translate-y-1/2 pointer-events-none clr-text-controls'
          size='1.25rem'
        />
      ) : null}
      <TextInput
        id={id}
        noOutline
        transparent
        placeholder={placeholder}
        type='search'
        className={clsx('bg-transparent', !noIcon && 'pl-8')}
        noBorder={noBorder}
        value={query}
        onChange={event => onChangeQuery?.(event.target.value)}
      />
    </div>
  );
}
