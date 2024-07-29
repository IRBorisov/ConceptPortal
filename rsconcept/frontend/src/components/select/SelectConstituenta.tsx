'use client';

import clsx from 'clsx';
import { useCallback, useMemo } from 'react';

import { CstMatchMode } from '@/models/miscellaneous';
import { ConstituentaID, IConstituenta } from '@/models/rsform';
import { matchConstituenta } from '@/models/rsformAPI';
import { describeConstituenta, describeConstituentaTerm } from '@/utils/labels';

import { CProps } from '../props';
import SelectSingle from '../ui/SelectSingle';

interface SelectConstituentaProps extends CProps.Styling {
  items?: IConstituenta[];
  value?: IConstituenta;
  onSelectValue: (newValue?: IConstituenta) => void;

  placeholder?: string;
  noBorder?: boolean;
}

function SelectConstituenta({
  className,
  items,
  value,
  onSelectValue,
  placeholder = 'Выберите конституенту',
  ...restProps
}: SelectConstituentaProps) {
  const options = useMemo(() => {
    return (
      items?.map(cst => ({
        value: cst.id,
        label: `${cst.alias}: ${describeConstituenta(cst)}`
      })) ?? []
    );
  }, [items]);

  const filter = useCallback(
    (option: { value: ConstituentaID | undefined; label: string }, inputValue: string) => {
      const cst = items?.find(item => item.id === option.value);
      return !cst ? false : matchConstituenta(cst, inputValue, CstMatchMode.ALL);
    },
    [items]
  );

  return (
    <SelectSingle
      className={clsx('text-ellipsis', className)}
      options={options}
      value={value ? { value: value.id, label: `${value.alias}: ${describeConstituentaTerm(value)}` } : null}
      onChange={data => onSelectValue(items?.find(cst => cst.id === data?.value))}
      // @ts-expect-error: TODO: use type definitions from react-select in filter object
      filterOption={filter}
      placeholder={placeholder}
      {...restProps}
    />
  );
}

export default SelectConstituenta;
