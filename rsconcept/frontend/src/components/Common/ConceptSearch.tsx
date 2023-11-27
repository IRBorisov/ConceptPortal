import { MagnifyingGlassIcon } from '../Icons';
import TextInput from './TextInput';

interface ConceptSearchProps  {
  value: string
  onChange?: (newValue: string) => void
  dense?: boolean
}

function ConceptSearch({ value, onChange, dense }: ConceptSearchProps) {
  const borderClass = dense ? 'border-t border-x': '';
  return (
  <div className='relative'>
    <div className='absolute inset-y-0 flex items-center pl-3 pointer-events-none text-controls'>
      <MagnifyingGlassIcon />
    </div>
    <TextInput
      dimensions={`w-full pl-10 ${borderClass} rounded`}
      placeholder='Поиск'
      noOutline
      noBorder={dense}
      value={value}
      onChange={event => (onChange ? onChange(event.target.value) : undefined)}
    />
  </div>);
}

export default ConceptSearch;


