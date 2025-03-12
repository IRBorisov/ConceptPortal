'use client';

import clsx from 'clsx';

import { SelectSingle } from '@/components/input1';
import { type Styling } from '@/components/props';

import { type IOperation } from '../models/oss';
import { matchOperation } from '../models/oss-api';

interface SelectOperationProps extends Styling {
  value: IOperation | null;
  onChange: (newValue: IOperation | null) => void;

  items?: IOperation[];
  placeholder?: string;
  noBorder?: boolean;
}

export function SelectOperation({
  className,
  items,
  value,
  onChange,
  placeholder = 'Выберите операцию',
  ...restProps
}: SelectOperationProps) {
  const options =
    items?.map(cst => ({
      value: cst.id,
      label: `${cst.alias}: ${cst.title}`
    })) ?? [];

  function filter(option: { value: string | undefined; label: string }, query: string) {
    const operation = items?.find(item => item.id === Number(option.value));
    return !operation ? false : matchOperation(operation, query);
  }

  return (
    <SelectSingle
      className={clsx('text-ellipsis', className)}
      options={options}
      value={value ? { value: value.id, label: `${value.alias}: ${value.title}` } : null}
      onChange={data => onChange(items?.find(cst => cst.id === data?.value) ?? null)}
      filterOption={filter}
      placeholder={placeholder}
      {...restProps}
    />
  );
}
