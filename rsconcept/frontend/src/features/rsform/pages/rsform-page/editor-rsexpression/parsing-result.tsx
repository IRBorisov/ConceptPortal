import clsx from 'clsx';

import { type AnalysisFull } from '@/features/rslang';
import { getRSErrorPrefix, isCritical, type RSErrorDescription } from '@/features/rslang/error';
import { describeRSError } from '@/features/rslang/labels';

import { type RO } from '@/utils/meta';

interface ParsingResultProps {
  data: RO<AnalysisFull> | null;
  disabled?: boolean;
  isOpen: boolean;
  onShowError: (error: RO<RSErrorDescription>) => void;
}

export function ParsingResult({ isOpen, data, disabled, onShowError }: ParsingResultProps) {
  const errorCount = data ? data.errors.reduce((total, error) => (isCritical(error.code) ? total + 1 : total), 0) : 0;
  const warningsCount = data ? data.errors.length - errorCount : 0;

  return (
    <div tabIndex={-1} className={clsx('cc-parsing-result text-sm border dense cc-scroll-y', isOpen && 'open')}>
      <p>
        Ошибок: <b>{errorCount}</b> | Предупреждений: <b>{warningsCount}</b>
      </p>
      {data?.errors.map((error, index) => {
        return (
          <p
            tabIndex={-1}
            key={`error-${index}`}
            className={`text-destructive break-all ${disabled ? '' : 'cursor-pointer'}`}
            onClick={disabled ? undefined : () => onShowError(error)}
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
