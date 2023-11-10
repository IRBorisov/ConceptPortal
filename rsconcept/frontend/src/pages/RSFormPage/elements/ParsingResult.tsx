import { IExpressionParse, IRSErrorDescription } from '../../../models/rslang';
import { describeRSError } from '../../../utils/labels';
import { getRSErrorPrefix } from '../../../utils/misc';

interface ParsingResultProps {
  data: IExpressionParse
  onShowError: (error: IRSErrorDescription) => void
}

function ParsingResult({ data, onShowError }: ParsingResultProps) {
  const errorCount = data.errors.reduce((total, error) => (error.isCritical ? total + 1 : total), 0);
  const warningsCount = data.errors.length - errorCount;

  return (
    <div className='px-2 py-1'>
      <p>Ошибок: <b>{errorCount}</b> | Предупреждений: <b>{warningsCount}</b></p>
      {data.errors.map((error, index) => {
        return (
        <p key={`error-${index}`} className='cursor-pointer text-warning' onClick={() => onShowError(error)}>
          <span className='mr-1 font-semibold underline'>{error.isCritical ? 'Ошибка' : 'Предупреждение'} {getRSErrorPrefix(error)}:</span>
          <span> {describeRSError(error)}</span>
        </p>
        );
      })}
    </div>
  )
}

export default ParsingResult;
