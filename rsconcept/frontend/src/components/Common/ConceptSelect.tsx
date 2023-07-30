import { PropsWithRef } from 'react';
import Select, { SelectProps } from 'react-dropdown-select';

interface ConceptSelectProps<T>
extends Omit<PropsWithRef<SelectProps<T>>, 'noDataLabel'> {
  
}

function ConceptSelect<T extends object | string>({  ...props }: ConceptSelectProps<T>) {
  return (
  <Select
    {...props}
    noDataLabel='Список пуст'
  />
  );
}

export default ConceptSelect;
