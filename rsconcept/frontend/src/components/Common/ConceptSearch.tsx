import { MagnifyingGlassIcon } from '../Icons';
import Overlay from './Overlay';
import TextInput from './TextInput';

interface ConceptSearchProps  {
  value: string
  onChange?: (newValue: string) => void
  dense?: boolean
  noBorder?: boolean
  dimensions?: string
}

function ConceptSearch({ value, onChange, noBorder, dimensions, dense }: ConceptSearchProps) {
  const borderClass = dense && !noBorder ? 'border-t border-x': '';
  return (
  <div className={dimensions}>
    <Overlay
      position='top-0 left-3 translate-y-1/2'
      className='flex items-center pointer-events-none text-controls'
    >
      <MagnifyingGlassIcon size={5} />
    </Overlay>
    <TextInput noOutline
      placeholder='Поиск'
      dimensions={`w-full pl-10 hover:text-clip outline-none ${borderClass}`}
      noBorder={dense || noBorder}
      value={value}
      onChange={event => (onChange ? onChange(event.target.value) : undefined)}
    />
  </div>);
}

export default ConceptSearch;


