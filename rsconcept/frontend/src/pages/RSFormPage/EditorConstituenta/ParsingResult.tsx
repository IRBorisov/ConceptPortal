import { IExpressionParse, IRSErrorDescription } from '../../../models/rslang';
import { describeRSError } from '../../../utils/labels';
import { getRSErrorPrefix } from '../../../utils/misc';

interface ParsingResultProps {
  data: IExpressionParse
  disabled?: boolean
  onShowError: (error: IRSErrorDescription) => void
}

function ParsingResult({ data, disabled, onShowError }: ParsingResultProps) {
  const errorCount = data.errors.reduce((total, error) => (error.isCritical ? total + 1 : total), 0);
  const warningsCount = data.errors.length - errorCount;

  return (
  <div className='px-2 py-1'>
    <p>Ошибок: <b>{errorCount}</b> | Предупреждений: <b>{warningsCount}</b></p>
    {data.errors.map(
    (error, index) => {
      return (
      <p
        key={`error-${index}`}
        className={`text-warning ${disabled ? '' : 'cursor-pointer'}`}
        onClick={disabled ? undefined : () => onShowError(error)}
      >
        <span className='mr-1 font-semibold underline'>
          {error.isCritical ? 'Ошибка' : 'Предупреждение'} {`${getRSErrorPrefix(error)}:`}
        </span>
        <span>{` ${describeRSError(error)}`}</span>
      </p>);
    })}
  </div>);
}

export default ParsingResult;
