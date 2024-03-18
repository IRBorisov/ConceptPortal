import { BiSearchAlt2 } from 'react-icons/bi';

import { CProps } from '../props';
import Overlay from './Overlay';
import TextInput from './TextInput';

interface SearchBarProps extends CProps.Styling {
  value: string;
  id?: string;
  onChange?: (newValue: string) => void;
  noBorder?: boolean;
}

function SearchBar({ id, value, onChange, noBorder, ...restProps }: SearchBarProps) {
  return (
    <div {...restProps}>
      <Overlay position='top-[-0.125rem] left-3 translate-y-1/2' className='pointer-events-none clr-text-controls'>
        <BiSearchAlt2 size='1.25rem' />
      </Overlay>
      <TextInput
        id={id}
        noOutline
        placeholder='Поиск'
        type='search'
        className='w-full pl-10'
        noBorder={noBorder}
        value={value}
        onChange={event => (onChange ? onChange(event.target.value) : undefined)}
      />
    </div>
  );
}

export default SearchBar;
