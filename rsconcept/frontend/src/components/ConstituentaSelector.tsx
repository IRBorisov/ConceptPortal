'use client';

import { useCallback, useMemo } from 'react';

import { CstMatchMode } from '@/models/miscellaneous';
import { EntityID, IConstituenta } from '@/models/rsform';
import { matchConstituenta } from '@/models/rsformAPI';
import { describeConstituenta, describeConstituentaTerm } from '@/utils/labels';

import SelectSingle from './ui/SelectSingle';

interface ConstituentaSelectorProps {
  items?: IConstituenta[];
  value?: IConstituenta;
  onSelectValue: (newValue?: IConstituenta) => void;
}

function ConstituentaSelector({ items, value, onSelectValue }: ConstituentaSelectorProps) {
  const options = useMemo(() => {
    return (
      items?.map(cst => ({
        value: cst.id,
        label: `${cst.alias}: ${describeConstituenta(cst)}`
      })) ?? []
    );
  }, [items]);

  const filter = useCallback(
    (option: { value: EntityID | undefined; label: string }, inputValue: string) => {
      const cst = items?.find(item => item.id === option.value);
      return !cst ? false : matchConstituenta(cst, inputValue, CstMatchMode.ALL);
    },
    [items]
  );

  return (
    <SelectSingle
      className='w-[20rem] text-ellipsis'
      options={options}
      value={{ value: value?.id, label: value ? `${value.alias}: ${describeConstituentaTerm(value)}` : '' }}
      onChange={data => onSelectValue(items?.find(cst => cst.id === data?.value))}
      // @ts-expect-error: TODO: use type definitions from react-select in filter object
      filterOption={filter}
    />
  );
}

export default ConstituentaSelector;
