'use client';

import clsx from 'clsx';

import { TextButton } from '@/components/control/text-button';
import { TextArea } from '@/components/input';
import { cn } from '@/components/utils';
import { globalIDs, limits } from '@/utils/constants';
import { formatInteger } from '@/utils/format';

import { type EvalStatus } from '../../models/rsmodel';

import { StatusBar } from './status-bar';
import { ToolbarValue } from './toolbar-value';

interface ValueInputProps {
  className?: string;
  rows?: number;
  disabled?: boolean;

  value: string;
  initialStr?: string;
  stub?: string;
  valueLabel: string;
  placeholder?: string;
  status: EvalStatus;

  onValueDialog?: () => void;
  onChangeStr?: (newValue: string) => void;
  onSubmit?: () => void;
  onCalculate?: (event: React.MouseEvent<Element>) => void;
}

/** Displays a badge with value cardinality and information tooltip. */
export function ValueInput({
  className, rows, placeholder, disabled, initialStr,
  value, stub, valueLabel, status,
  onChangeStr, onValueDialog, onCalculate, onSubmit
}: ValueInputProps) {
  const isTrimmed = value.length > limits.len_data_str;
  return (
    <div className='relative flex flex-col gap-2'>
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

      <ToolbarValue
        className='absolute -top-1 right-0'
        value={value}
        disabled={disabled}
        onChange={onChangeStr}
        onReset={initialStr ? () => onChangeStr?.(initialStr) : undefined}
        isModified={initialStr !== value}
        onSubmit={onSubmit}
      />

      {stub ?
        (<div className={clsx(
          'absolute bottom-0 left-0',
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

      <TextButton
        text='Значение'
        title='Просмотр значения'
        onClick={onValueDialog}
        hideTitle={!onValueDialog}
        disabled={!onValueDialog}
      />
      <TextArea
        value={value.slice(0, limits.len_data_str)}
        onChange={event => onChangeStr?.(event.target.value)}
        fitContent
        areaClassName={cn(value ? 'font-math text-sm' : '', className)}
        rows={rows}
        spellCheck
        placeholder={placeholder}
        disabled={isTrimmed || disabled}
      />
      {value.length > 0 ?
        (<div
          className={clsx('select-none ml-auto', isTrimmed && 'text-destructive')}
          aria-label='Количество символов'
          data-tooltip-id={globalIDs.tooltip}
          data-tooltip-html='Отображаемое количество</br>символов ограничено'
        >
          {`${formatInteger(value.length)} / ${formatInteger(limits.len_data_str)}`}
        </div>) : null}
    </div>
  );
}
