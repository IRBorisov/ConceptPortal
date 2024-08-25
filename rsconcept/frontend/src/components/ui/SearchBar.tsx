import clsx from 'clsx';

import { IconSearch } from '../Icons';
import { CProps } from '../props';
import Overlay from './Overlay';
import TextInput from './TextInput';

interface SearchBarProps extends CProps.Styling {
  value: string;
  noIcon?: boolean;
  id?: string;
  placeholder?: string;
  onChange?: (newValue: string) => void;
  noBorder?: boolean;
}

function SearchBar({ id, value, noIcon, onChange, noBorder, placeholder = 'Поиск', ...restProps }: SearchBarProps) {
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
        className={clsx('w-full outline-none bg-transparent', !noIcon && 'pl-10')}
        noBorder={noBorder}
        value={value}
        onChange={event => (onChange ? onChange(event.target.value) : undefined)}
      />
    </div>
  );
}

export default SearchBar;
