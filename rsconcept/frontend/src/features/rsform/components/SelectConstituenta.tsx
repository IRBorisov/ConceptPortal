'use client';

import clsx from 'clsx';

import { SelectSingle } from '@/components/Input';
import { CProps } from '@/components/props';

import { describeConstituenta, describeConstituentaTerm } from '../labels';
import { IConstituenta } from '../models/rsform';
import { matchConstituenta } from '../models/rsformAPI';
import { CstMatchMode } from '../stores/cstSearch';

interface SelectConstituentaProps extends CProps.Styling {
  value?: IConstituenta;
  onChange: (newValue?: IConstituenta) => void;

  items?: IConstituenta[];
  placeholder?: string;
  noBorder?: boolean;
}

function SelectConstituenta({
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
      onChange={data => onChange(items?.find(cst => cst.id === data?.value))}
      filterOption={filter}
      placeholder={placeholder}
      {...restProps}
    />
  );
}

export default SelectConstituenta;
