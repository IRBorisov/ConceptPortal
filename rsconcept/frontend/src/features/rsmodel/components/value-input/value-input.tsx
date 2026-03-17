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
  stub?: string;
  valueLabel: string;
  placeholder?: string;
  status: EvalStatus;

  onChange?: (newValue: string) => void;
  onCalculate?: (event: React.MouseEvent<Element>) => void;
}

/** Displays a badge with value cardinality and information tooltip. */
export function ValueInput({
  className, rows, placeholder, disabled,
  value, stub, valueLabel, status,
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
      <div className='absolute -top-0.5 left-24 select-none'>
        <span
          tabIndex={-1}
          className='font-math'
          aria-label='Мощность / значение выражения'
          data-tooltip-id={globalIDs.tooltip}
          data-tooltip-content='Значение выражения'
        >
          {formatInteger(valueLabel)}
        </span>
      </div>
      {value.length > 0 ?
        (<div
          className={clsx(
            'absolute -bottom-1 right-0 translate-y-full select-none',
            isTrimmed && 'text-destructive'
          )}
          aria-label='Количество символов'
          data-tooltip-id={globalIDs.tooltip}
          data-tooltip-content='Отображаемое количество символов ограничено'
        >
          {`${formatInteger(value.length)} / ${formatInteger(limits.len_data_str)}`}
        </div>) : null}

      <ToolbarValue
        className='absolute -top-1 right-0'
        value={value}
        disabled={disabled}
        onChange={onChange}
      />

      {stub ?
        (<div className={clsx(
          'absolute -bottom-1 left-0 translate-y-full',
          'select-text text-muted-foreground'
        )}>
          <span
            tabIndex={-1}
            className='font-math'
            aria-label='Сокращенное обозначение выражения'
            data-tooltip-id={globalIDs.tooltip}
            data-tooltip-content='Сокращение выражения'
          >
            {stub}
          </span>
        </div>) : null}

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
