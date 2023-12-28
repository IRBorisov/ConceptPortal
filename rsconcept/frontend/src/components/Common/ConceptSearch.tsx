import { BiSearchAlt2 } from 'react-icons/bi';

import { CProps } from '../props';
import Overlay from './Overlay';
import TextInput from './TextInput';

interface ConceptSearchProps extends CProps.Styling {
  value: string;
  onChange?: (newValue: string) => void;
  noBorder?: boolean;
}

function ConceptSearch({ value, onChange, noBorder, ...restProps }: ConceptSearchProps) {
  return (
    <div {...restProps}>
      <Overlay position='top-[-0.125rem] left-3 translate-y-1/2' className='pointer-events-none clr-text-controls'>
        <BiSearchAlt2 size='1.25rem' />
      </Overlay>
      <TextInput
        noOutline
        placeholder='Поиск'
        className='pl-10'
        noBorder={noBorder}
        value={value}
        onChange={event => (onChange ? onChange(event.target.value) : undefined)}
      />
    </div>
  );
}

export default ConceptSearch;
