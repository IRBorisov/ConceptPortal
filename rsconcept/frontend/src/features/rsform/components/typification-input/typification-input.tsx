'use client';

import { applyAsciiTypeSubstitutions } from '@/domain/rslang/semantic/typification-parser';

import { TextArea } from '@/components/input';
import { type Styling } from '@/components/props';

export interface TypificationInputProps extends Styling {
  id?: string;
  label: string;
  placeholder?: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  areaClassName?: string;
}

/** Single-line-friendly typification editor: normalizes ASCII while typing. */
export function TypificationInput({ onChange, areaClassName, ...restProps }: TypificationInputProps) {
  return (
    <TextArea
      dense
      fitContent
      noResize
      spellCheck={false}
      areaClassName={areaClassName}
      onChange={event => onChange(applyAsciiTypeSubstitutions(event.target.value))}
      {...restProps}
    />
  );
}
