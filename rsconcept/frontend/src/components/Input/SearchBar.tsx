import clsx from 'clsx';

import { Overlay } from '@/components/Container';
import { IconSearch } from '@/components/Icons';
import { type Styling } from '@/components/props';

import { TextInput } from './TextInput';

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
  placeholder = 'Поиск',
  ...restProps
}: SearchBarProps) {
  return (
    <div {...restProps}>
      {!noIcon ? (
        <Overlay position='top-[-0.125rem] left-3 translate-y-1/2' className='pointer-events-none clr-text-controls'>
          <IconSearch size='1.25rem' />
        </Overlay>
      ) : null}
      <TextInput
        id={id}
        noOutline
        placeholder={placeholder}
        type='search'
        colors='bg-transparent'
        className={clsx(!noIcon && 'pl-10')}
        noBorder={noBorder}
        value={query}
        onChange={event => onChangeQuery?.(event.target.value)}
      />
    </div>
  );
}
