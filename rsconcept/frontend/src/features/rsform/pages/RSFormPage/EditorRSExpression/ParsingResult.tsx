import { IExpressionParseDTO, IRSErrorDescription } from '../../../backend/types';
import { describeRSError } from '../../../labels';
import { getRSErrorPrefix } from '../../../models/rslangAPI';

interface ParsingResultProps {
  data: IExpressionParseDTO | undefined;
  disabled?: boolean;
  isOpen: boolean;
  onShowError: (error: IRSErrorDescription) => void;
}

function ParsingResult({ isOpen, data, disabled, onShowError }: ParsingResultProps) {
  const errorCount = data ? data.errors.reduce((total, error) => (error.isCritical ? total + 1 : total), 0) : 0;
  const warningsCount = data ? data.errors.length - errorCount : 0;

  return (
    <div
      tabIndex={-1}
      className='text-sm border dense cc-scroll-y transition-all duration-300'
      style={{
        clipPath: isOpen ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)',
        marginTop: isOpen ? '0.75rem' : '0rem',
        padding: isOpen ? '0.25rem 0.5rem 0.25rem 0.5rem' : '0rem 0rem 0rem 0rem',
        borderWidth: isOpen ? '1px' : '0px',
        height: isOpen ? '4.5rem' : '0rem'
      }}
    >
      <p>
        Ошибок: <b>{errorCount}</b> | Предупреждений: <b>{warningsCount}</b>
      </p>
      {data?.errors.map((error, index) => {
        return (
          <p
            tabIndex={-1}
            key={`error-${index}`}
            className={`text-warn-600 break-all ${disabled ? '' : 'cursor-pointer'}`}
            onClick={disabled ? undefined : () => onShowError(error)}
          >
            <span className='mr-1 font-semibold underline'>
              {error.isCritical ? 'Ошибка' : 'Предупреждение'} {`${getRSErrorPrefix(error)}:`}
            </span>
            <span>{` ${describeRSError(error)}`}</span>
          </p>
        );
      })}
    </div>
  );
}

export default ParsingResult;
