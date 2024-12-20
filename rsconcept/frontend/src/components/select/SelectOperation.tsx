'use client';

import clsx from 'clsx';

import { IOperation, OperationID } from '@/models/oss';
import { matchOperation } from '@/models/ossAPI';

import { CProps } from '../props';
import SelectSingle from '../ui/SelectSingle';

interface SelectOperationProps extends CProps.Styling {
  items?: IOperation[];
  value?: IOperation;
  onSelectValue: (newValue?: IOperation) => void;

  placeholder?: string;
  noBorder?: boolean;
}

function SelectOperation({
  className,
  items,
  value,
  onSelectValue,
  placeholder = 'Выберите операцию',
  ...restProps
}: SelectOperationProps) {
  const options =
    items?.map(cst => ({
      value: cst.id,
      label: `${cst.alias}: ${cst.title}`
    })) ?? [];

  function filter(option: { value: OperationID | undefined; label: string }, inputValue: string) {
    const operation = items?.find(item => item.id === option.value);
    return !operation ? false : matchOperation(operation, inputValue);
  }

  return (
    <SelectSingle
      className={clsx('text-ellipsis', className)}
      options={options}
      value={value ? { value: value.id, label: `${value.alias}: ${value.title}` } : null}
      onChange={data => onSelectValue(items?.find(cst => cst.id === data?.value))}
      // @ts-expect-error: TODO: use type definitions from react-select in filter object
      filterOption={filter}
      placeholder={placeholder}
      {...restProps}
    />
  );
}

export default SelectOperation;
