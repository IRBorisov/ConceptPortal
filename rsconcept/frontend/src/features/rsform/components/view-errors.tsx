'use client';

import { getRSErrorPrefix, isCritical, type RSErrorDescription } from '@/domain/rslang/error';
import { describeRSError } from '@/domain/rslang/labels';
import { useTx } from '@/i18n';

import { cn } from '@/components/utils';
import { type RO } from '@/utils/meta';

interface ViewErrorsProps {
  errors: RO<RSErrorDescription[]> | null;
  disabled?: boolean;
  isOpen: boolean;
  onShowError?: (error: RO<RSErrorDescription>) => void;
  className?: string;
}

export function ViewErrors({ isOpen, errors, disabled, className, onShowError }: ViewErrorsProps) {
  const tx = useTx();
  const errorCount = errors ? errors.reduce((total, error) => (isCritical(error.code) ? total + 1 : total), 0) : 0;
  const warningsCount = errors ? errors.length - errorCount : 0;

  return (
    <div
      tabIndex={-1}
      className={cn('cc-parsing-result text-sm border dense cc-scroll-y', isOpen && 'open', className)}
    >
      <p>
        <span>{tx('ui.rsform.errors.count', { count: errorCount })} </span>
        {warningsCount > 0 ? <span>| {tx('ui.rsform.errors.warnings', { count: warningsCount })}</span> : null}
      </p>
      {errors?.map((error, index) => {
        return (
          <p
            tabIndex={-1}
            key={`error-${index}`}
            className={`text-destructive break-all ${disabled || !onShowError ? '' : 'cursor-pointer'}`}
            onClick={disabled || !onShowError ? undefined : () => onShowError(error)}
          >
            <span className='mr-1 font-semibold underline'>
              {isCritical(error.code) ? tx('tx.general.error') : tx('tx.general.warning')}{' '}
              {`${getRSErrorPrefix(error.code)}:`}
            </span>
            <span>{` ${describeRSError(error.code, error.params)}`}</span>
          </p>
        );
      })}
    </div>
  );
}
