import { MagnifyingGlassIcon } from '../Icons';
import Overlay from './Overlay';
import TextInput from './TextInput';

interface ConceptSearchProps  {
  value: string
  onChange?: (newValue: string) => void
  noBorder?: boolean
  dimensions?: string
}

function ConceptSearch({ value, onChange, noBorder, dimensions }: ConceptSearchProps) {
  return (
  <div className={dimensions}>
    <Overlay
      position='top-[-0.125rem] left-3 translate-y-1/2'
      className='pointer-events-none clr-text-controls'
    >
      <MagnifyingGlassIcon size={5} />
    </Overlay>
    <TextInput noOutline
      placeholder='Поиск'
      dimensions='w-full pl-10'
      noBorder={noBorder}
      value={value}
      onChange={event => (onChange ? onChange(event.target.value) : undefined)}
    />
  </div>);
}

export default ConceptSearch;