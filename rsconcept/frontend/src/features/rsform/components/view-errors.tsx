'use client';

import { getRSErrorPrefix, isCritical, type RSErrorDescription } from '@rsconcept/domain/rslang/error';
import { useTx } from '@/i18n';

import { cn } from '@/components/utils';

import { describeRSError } from '../labels';

interface ViewErrorsProps {
  errors: RSErrorDescription[] | null;
  disabled?: boolean;
  isOpen: boolean;
  onShowError?: (error: RSErrorDescription) => void;
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
        <span>{tx('tx.general.error.plural') + tx('tx.general.colon') + errorCount}</span>
        {warningsCount > 0 ? (
          <span> | {tx('tx.general.warning.plural') + tx('tx.general.colon') + warningsCount}</span>
        ) : null}
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
