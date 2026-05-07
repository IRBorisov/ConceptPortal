'use client';

import { type Constituenta } from '@/domain/library';
import { useTx } from '@/i18n';

import { ComboBox } from '@/components/input/combo-box';

import { describeConstituenta, describeConstituentaTerm } from '../labels';

interface SelectConstituentaProps {
  id?: string;
  value: Constituenta | null;
  onChange: (newValue: Constituenta | null) => void;

  className?: string;
  items?: Constituenta[];
  placeholder?: string;
  noBorder?: boolean;
}

export function SelectConstituenta({ items, placeholder, ...restProps }: SelectConstituentaProps) {
  const tx = useTx();
  const resolvedPlaceholder = placeholder ?? tx('tx.cst.select');
  return (
    <ComboBox
      items={items}
      placeholder={resolvedPlaceholder}
      idFunc={cst => String(cst.id)}
      labelValueFunc={cst => `${cst.alias}${tx('tx.general.colon')}${describeConstituentaTerm(cst)}`}
      labelOptionFunc={cst =>
        `${cst.alias}${cst.is_inherited ? '*' : ''}${tx('tx.general.colon')}${describeConstituenta(cst)}`
      }
      {...restProps}
    />
  );
}
