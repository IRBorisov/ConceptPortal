import { getRSErrorPrefix, isCritical, type RSErrorDescription } from '@/features/rslang/error';
import { describeRSError } from '@/features/rslang/labels';

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
  const errorCount = errors ? errors.reduce((total, error) => (isCritical(error.code) ? total + 1 : total), 0) : 0;
  const warningsCount = errors ? errors.length - errorCount : 0;

  return (
    <div tabIndex={-1} className={cn('cc-parsing-result text-sm border dense cc-scroll-y', isOpen && 'open', className)}>
      <p>
        Ошибок: <b>{errorCount}</b> | Предупреждений: <b>{warningsCount}</b>
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
              {isCritical(error.code) ? 'Ошибка' : 'Предупреждение'} {`${getRSErrorPrefix(error.code)}:`}
            </span>
            <span>{` ${describeRSError(error.code, error.params)}`}</span>
          </p>
        );
      })}
    </div>
  );
}
