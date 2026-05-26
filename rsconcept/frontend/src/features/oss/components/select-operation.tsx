'use client';

import { type Operation } from '@rsconcept/domain/library';
import { useTx } from '@/i18n';

import { ComboBox } from '@/components/input/combo-box';
import { type Styling } from '@/components/props';

interface SelectOperationProps extends Styling {
  id?: string;
  value: Operation | null;
  onChange: (newValue: Operation | null) => void;
  className?: string;

  items?: Operation[];
  placeholder?: string;
  noBorder?: boolean;
  popoverClassname?: string;
}

export function SelectOperation({ items, placeholder, ...restProps }: SelectOperationProps) {
  const tx = useTx();
  const resolvedPlaceholder = placeholder ?? tx('tx.operation.select');
  return (
    <ComboBox
      items={items}
      placeholder={resolvedPlaceholder}
      idFunc={operation => String(operation.id)}
      labelValueFunc={operation => `${operation.alias}: ${operation.title}`}
      labelOptionFunc={operation => `${operation.alias}: ${operation.title}`}
      {...restProps}
    />
  );
}
