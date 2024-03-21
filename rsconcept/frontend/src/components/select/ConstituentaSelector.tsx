'use client';

import clsx from 'clsx';
import { useCallback, useMemo } from 'react';

import { CstMatchMode } from '@/models/miscellaneous';
import { ConstituentaID, IConstituenta } from '@/models/rsform';
import { matchConstituenta } from '@/models/rsformAPI';
import { describeConstituenta, describeConstituentaTerm } from '@/utils/labels';

import { CProps } from '../props';
import SelectSingle from '../ui/SelectSingle';

interface ConstituentaSelectorProps extends CProps.Styling {
  items?: IConstituenta[];
  value?: IConstituenta;
  onSelectValue: (newValue?: IConstituenta) => void;
}

function ConstituentaSelector({ className, items, value, onSelectValue, ...restProps }: ConstituentaSelectorProps) {
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
      value={{ value: value?.id, label: value ? `${value.alias}: ${describeConstituentaTerm(value)}` : '' }}
      onChange={data => onSelectValue(items?.find(cst => cst.id === data?.value))}
      // @ts-expect-error: TODO: use type definitions from react-select in filter object
      filterOption={filter}
      {...restProps}
    />
  );
}

export default ConstituentaSelector;
