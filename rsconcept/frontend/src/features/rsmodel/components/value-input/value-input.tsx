'use client';

import clsx from 'clsx';

import { type EvalStatus } from '@/domain/library';

import { IconShowDataText } from '@/features/rsmodel/components/icon-show-data-text';

import { MiniButton } from '@/components/control';
import { Label, TextArea } from '@/components/input';
import { cn } from '@/components/utils';
import { globalIDs, limits } from '@/utils/constants';
import { formatInteger } from '@/utils/format';

import { StatusBar } from './status-bar';

interface ValueInputProps {
  areaClassname?: string;
  className?: string;
  rows?: number;
  disabled?: boolean;

  isBinding?: boolean;
  value: string;
  stub?: string;
  valueLabel: string;
  placeholder?: string;
  status: EvalStatus;
  showDataText?: boolean;

  onValueDialog?: () => void;
  onChangeStr?: (newValue: string) => void;
  onCalculate?: (event: React.MouseEvent<Element>) => void;
  onToggleDataText?: () => void;
}

/** Displays a badge with value cardinality and information tooltip. */
export function ValueInput({
  areaClassname,
  className,
  rows,
  placeholder,
  disabled,
  value,
  stub,
  valueLabel,
  status,
  showDataText,
  isBinding,
  onValueDialog: _onValueDialog,
  onChangeStr,
  onCalculate,
  onToggleDataText
}: ValueInputProps) {
  const isTrimmed = value.length > limits.len_data_str;
  return (
    <div className={cn('relative flex flex-col gap-2', className)}>
      <StatusBar className='absolute top-0 right-1/2 translate-x-1/2' status={status} onCalculate={onCalculate} />
      {onToggleDataText && !isBinding ? (
        <MiniButton
          title='Отображение данных в тексте'
          className='absolute top-0 right-0'
          icon={<IconShowDataText size='1.25rem' className='hover:text-primary' value={!!showDataText} />}
          onClick={onToggleDataText}
        />
      ) : null}

      <div className='flex items-center gap-3'>
        <Label text='Значение' />
        <span
          tabIndex={-1}
          className='font-math select-none'
          aria-label='Мощность / значение выражения'
          data-tooltip-id={globalIDs.tooltip}
          data-tooltip-content='Значение выражения'
        >
          {formatInteger(valueLabel)}
        </span>
      </div>

      {stub ? (
        <div className={clsx('absolute bottom-0 left-0', 'select-text text-muted-foreground')}>
          <span
            tabIndex={-1}
            className='font-math'
            aria-label='Сокращенное обозначение выражения'
            data-tooltip-id={globalIDs.tooltip}
            data-tooltip-content='Сокращение выражения'
          >
            {stub}
          </span>
        </div>
      ) : null}
      <TextArea
        value={value.slice(0, limits.len_data_str)}
        onChange={event => onChangeStr?.(event.target.value)}
        fitContent
        areaClassName={cn(value ? 'font-math text-sm' : '', areaClassname)}
        rows={rows}
        spellCheck
        placeholder={placeholder}
        disabled={isTrimmed || disabled}
      />
      {value.length > 0 ? (
        <div
          className={clsx('select-none ml-auto', isTrimmed && 'text-destructive')}
          aria-label='Количество символов'
          data-tooltip-id={globalIDs.tooltip}
          data-tooltip-html='Отображаемое количество</br>символов ограничено'
        >
          {`${formatInteger(value.length)} / ${formatInteger(limits.len_data_str)}`}
        </div>
      ) : null}
    </div>
  );
}
