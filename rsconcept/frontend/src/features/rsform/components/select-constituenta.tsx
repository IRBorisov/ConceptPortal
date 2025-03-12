'use client';

import clsx from 'clsx';

import { SelectSingle } from '@/components/input';
import { type Styling } from '@/components/props';

import { describeConstituenta, describeConstituentaTerm } from '../labels';
import { type IConstituenta } from '../models/rsform';
import { matchConstituenta } from '../models/rsform-api';
import { CstMatchMode } from '../stores/cst-search';

interface SelectConstituentaProps extends Styling {
  value: IConstituenta | null;
  onChange: (newValue: IConstituenta | null) => void;

  items?: IConstituenta[];
  placeholder?: string;
  noBorder?: boolean;
}

export function SelectConstituenta({
  className,
  items,
  value,
  onChange,
  placeholder = 'Выберите конституенту',
  ...restProps
}: SelectConstituentaProps) {
  const options =
    items?.map(cst => ({
      value: cst.id,
      label: `${cst.alias}${cst.is_inherited ? '*' : ''}: ${describeConstituenta(cst)}`
    })) ?? [];

  function filter(option: { value: string | undefined; label: string }, query: string) {
    const cst = items?.find(item => item.id === Number(option.value));
    return !cst ? false : matchConstituenta(cst, query, CstMatchMode.ALL);
  }

  return (
    <SelectSingle
      className={clsx('text-ellipsis', className)}
      options={options}
      value={value ? { value: value.id, label: `${value.alias}: ${describeConstituentaTerm(value)}` } : null}
      onChange={data => onChange(items?.find(cst => cst.id === data?.value) ?? null)}
      filterOption={filter}
      placeholder={placeholder}
      {...restProps}
    />
  );
}
