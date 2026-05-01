'use client';

import { type Block } from '@/domain/library';

import { useTx } from '@/app/i18n/use-tx';

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
  const resolvedPlaceholder = placeholder ?? tx('ui.oss.selectBlock.placeholder', 'Select block');
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
