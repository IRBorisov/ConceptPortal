'use client';

import { type Block } from '@rsconcept/domain/library';
import { useTx } from '@/i18n';

import { ComboBox } from '@/components/input/combo-box';
import { type Styling } from '@/components/props';

interface SelectBlockProps extends Styling {
  id?: string;
  value: Block | null;
  onChange: (newValue: Block | null) => void;

  items?: Block[];
  placeholder?: string;
  noBorder?: boolean;
  popoverClassname?: string;
}

export function SelectBlock({ items, placeholder, ...restProps }: SelectBlockProps) {
  const tx = useTx();
  const resolvedPlaceholder = placeholder ?? tx('tx.oss.block.select');
  return (
    <ComboBox
      items={items}
      clearable
      placeholder={resolvedPlaceholder}
      idFunc={block => String(block.id)}
      labelValueFunc={block => block.title}
      labelOptionFunc={block => block.title}
      {...restProps}
    />
  );
}
