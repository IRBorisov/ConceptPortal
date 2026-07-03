'use client';

import { useTx } from '@/i18n';
import { getRSErrorPrefix, isCritical, type RSErrorDescription } from '@rsconcept/domain/rslang/error';

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

  return (
    <div
      tabIndex={-1}
      className={cn('cc-parsing-result text-sm border dense cc-scroll-y', isOpen && 'open', className)}
    >
      {errors?.map((error, index) => {
        return (
          <p
            tabIndex={-1}
            key={`error-${index}`}
            className={cn('text-destructive wrap-break-word', !disabled && onShowError && 'cursor-pointer')}
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
