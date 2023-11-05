import { Dispatch } from 'react';

import ConceptSearch from '../../components/Common/ConceptSearch';
import RSInput from '../../components/RSInput';
import { IArgumentValue } from '../../models/rslang';

interface ArgumentsTabProps {
  state: IArgumentsState
  partialUpdate: Dispatch<Partial<IArgumentsState>>
}

export interface IArgumentsState {
  arguments?: IArgumentValue[]
  filterText: string
  definition: string
}

function ArgumentsTab({state, partialUpdate}: ArgumentsTabProps) {
  return (
  <div className='flex flex-col gap-3'>
    <ConceptSearch 
      value={state.filterText}
      onChange={newValue => partialUpdate({ filterText: newValue} )}
      dense
    />
    <RSInput id='result'
      placeholder='Итоговое определение'
      height='4.8rem'
      value={state.definition}
      disabled
    />
  </div>);
}

export default ArgumentsTab;
