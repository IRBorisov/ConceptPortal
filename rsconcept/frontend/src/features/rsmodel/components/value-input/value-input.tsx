'use client';

import clsx from 'clsx';

import { TextArea } from '@/components/input';
import { cn } from '@/components/utils';
import { globalIDs, limits } from '@/utils/constants';
import { formatInteger } from '@/utils/utils';

import { type EvalStatus } from '../../models/rsmodel';

import { StatusBar } from './status-bar';
import { ToolbarValue } from './toolbar-value';

interface ValueInputProps {
  className?: string;
  rows?: number;
  disabled?: boolean;

  value: string;
  valueLabel: string;
  placeholder?: string;
  status: EvalStatus;

  onChange?: (newValue: string) => void;
  onCalculate?: (event: React.MouseEvent<Element>) => void;
}

/** Displays a badge with value cardinality and information tooltip. */
export function ValueInput({
  className, rows, placeholder, disabled,
  value, valueLabel, status,
  onChange, onCalculate
}: ValueInputProps) {
  const isTrimmed = value.length > limits.len_data_str;
  return (
    <div className='relative'>
      <StatusBar
        className='absolute -top-0.5 right-1/2 translate-x-1/2'
        status={status}
        onCalculate={onCalculate}
      />
      <div className='absolute -top-0.5 left-24 select-none flex gap-2 items-center'>
        <span
          className='font-math'
          tabIndex={-1}
          data-tooltip-id={globalIDs.tooltip}
          aria-label='Сокращенное значение выражения'
          data-tooltip-content='Значение выражения'
        >
          {formatInteger(valueLabel)}
        </span>
      </div>
      {value.length > 0 ?
        (<div className={clsx(
          'absolute -bottom-1 right-0 translate-y-full select-none',
          isTrimmed && 'text-destructive'
        )}>
          {`${formatInteger(value.length)} / ${formatInteger(limits.len_data_str)}`}
        </div>) : null}

      <ToolbarValue className='absolute -top-1 right-0' value={value} />

      <TextArea
        value={value.slice(0, limits.len_data_str)}
        onChange={event => onChange?.(event.target.value)}
        fitContent
        className={cn(value ? 'font-math text-sm' : '', className)}
        rows={rows}
        spellCheck
        label='Значение'
        placeholder={placeholder}
        disabled={isTrimmed || disabled}
      />
    </div>
  );
}
