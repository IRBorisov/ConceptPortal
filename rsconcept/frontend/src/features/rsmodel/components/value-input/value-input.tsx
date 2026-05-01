'use client';

import clsx from 'clsx';

import { type EvalStatus } from '@/domain/library';
import { useTx } from '@/i18n';

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

  onChange?: (newValue: string) => void;
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
  onChange,
  onCalculate,
  onToggleDataText
}: ValueInputProps) {
  const tx = useTx();
  const isTrimmed = value.length > limits.len_data_str;
  return (
    <div className={cn('relative flex flex-col gap-2', className)}>
      <StatusBar className='absolute -top-1 right-1/2 translate-x-1/2' status={status} onCalculate={onCalculate} />
      {onToggleDataText && !isBinding ? (
        <MiniButton
          title={tx('ui.value.showDataInText', 'Show data as text')}
          className='absolute top-0 right-0'
          icon={<IconShowDataText size='1.25rem' className='hover:text-primary' value={!!showDataText} />}
          onClick={onToggleDataText}
        />
      ) : null}

      <Label text={tx('ui.valueInput.labelValue', 'Value')} />

      <TextArea
        value={value.slice(0, limits.len_data_str)}
        onChange={event => onChange?.(event.target.value)}
        fitContent
        areaClassName={cn(value ? 'font-math text-sm' : '', areaClassname)}
        rows={rows}
        spellCheck
        placeholder={placeholder}
        disabled={isTrimmed || disabled}
      />
      {stub || (value.length > 0 && !disabled) ? (
        <div className='flex'>
          {stub ? (
            <div className='flex gap-2 text-muted-foreground'>
              <span
                tabIndex={-1}
                className='font-math select-none'
                aria-label={tx('ui.valueInput.cardinalityExpressionAria', 'Cardinality / expression value')}
                data-tooltip-id={globalIDs.tooltip}
                data-tooltip-content={tx('ui.valueInput.expressionValueTooltip', 'Expression value')}
              >
                {tx('ui.valueInput.cardinalityPrefix', 'Cardinality:')} {formatInteger(valueLabel)} |
              </span>
              <span
                tabIndex={-1}
                className='font-math select-text'
                aria-label={tx('ui.valueInput.shortFormAria', 'Short form of the expression')}
                data-tooltip-id={globalIDs.tooltip}
                data-tooltip-content={tx('ui.valueInput.shortFormTooltip', 'Expression abbreviation')}
              >
                {stub}
              </span>
            </div>
          ) : null}
          {value.length > 0 && !disabled ? (
            <div
              className={clsx('ml-auto select-none', isTrimmed && 'text-destructive')}
              aria-label={tx('ui.valueInput.charCountAria', 'Character count')}
              data-tooltip-id={globalIDs.tooltip}
              data-tooltip-content={tx(
                'ui.valueInput.charCountLimitedTooltip',
                'Displayed character count\nis limited'
              )}
            >
              {`${formatInteger(value.length)} / ${formatInteger(limits.len_data_str)}`}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
