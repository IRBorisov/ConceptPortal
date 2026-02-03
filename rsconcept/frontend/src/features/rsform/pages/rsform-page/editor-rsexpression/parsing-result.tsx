import clsx from 'clsx';

import { getRSErrorPrefix, isCritical } from '@/features/rslang/error';
import { describeRSError } from '@/features/rslang/labels';

import { type RO } from '@/utils/meta';

import { type IExpressionParseDTO, type IRSErrorDescription } from '../../../backend/types';

interface ParsingResultProps {
  data: RO<IExpressionParseDTO> | null;
  disabled?: boolean;
  isOpen: boolean;
  onShowError: (error: RO<IRSErrorDescription>) => void;
}

export function ParsingResult({ isOpen, data, disabled, onShowError }: ParsingResultProps) {
  const errorCount = data ? data.errors.reduce((total, error) => (error.isCritical ? total + 1 : total), 0) : 0;
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
              {isCritical(error.errorType) ? 'Ошибка' : 'Предупреждение'} {`${getRSErrorPrefix(error.errorType)}:`}
            </span>
            <span>{` ${describeRSError(error.errorType, error.params)}`}</span>
          </p>
        );
      })}
    </div>
  );
}
