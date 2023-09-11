import { IExpressionParse, IRSErrorDescription, SyntaxTree } from '../../../models/rslang';
import { getRSErrorMessage, getRSErrorPrefix } from '../../../utils/staticUI';

interface ParsingResultProps {
  data: IExpressionParse
  onShowAST: (ast: SyntaxTree) => void
  onShowError: (error: IRSErrorDescription) => void
}

function ParsingResult({ data, onShowAST, onShowError }: ParsingResultProps) {
  const errorCount = data.errors.reduce((total, error) => (error.isCritical ? total + 1 : total), 0);
  const warningsCount = data.errors.length - errorCount;

  function handleShowAST() {
    onShowAST(data.ast);
  }

  return (
    <div className='px-3 py-2'>
      <p>Ошибок: <b>{errorCount}</b> | Предупреждений: <b>{warningsCount}</b></p>
      {data.errors.map((error, index) => {
        return (
        <p key={`error-${index}`} className='cursor-pointer text-warning' onClick={() => onShowError(error)}>
          <span className='mr-1 font-semibold underline'>{error.isCritical ? 'Ошибка' : 'Предупреждение'} {getRSErrorPrefix(error)}:</span>
          <span> {getRSErrorMessage(error)}</span>
        </p>
        );
      })}
      {data.astText && 
      <p>
        <button type='button' 
          className='font-semibold underline text-primary'
          title='отобразить дерево разбора'
          onClick={handleShowAST}
          tabIndex={-1}
        >
          Дерево разбора
        </button>
      </p>}
    </div>
  )
}

export default ParsingResult;
