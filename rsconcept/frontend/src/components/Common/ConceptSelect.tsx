import { PropsWithRef } from 'react';
import Select, { SelectProps } from 'react-dropdown-select';

interface ConceptSelectProps<T>
extends Omit<PropsWithRef<SelectProps<T>>, 'noDataLabel'> {
  
}

function ConceptSelect<T extends object | string>({ className,  ...props }: ConceptSelectProps<T>) {
  return (
  <Select
    className={`overflow-x-ellipsis whitespace-nowrap clr-border clr-input outline-none ${className}`}
    {...props}
    noDataLabel='Список пуст'
  />
  );
}

export default ConceptSelect;
