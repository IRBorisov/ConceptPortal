import { IExpressionParse, SyntaxTree } from '../../../utils/models';
import { getRSErrorMessage, getRSErrorPrefix } from '../../../utils/staticUI';

interface ParsingResultProps {
  data: IExpressionParse
  onShowAST: (ast: SyntaxTree) => void
}

function ParsingResult({ data, onShowAST }: ParsingResultProps) {
  const errorCount = data.errors.reduce((total, error) => (error.isCritical ? total + 1 : total), 0);
  const warningsCount = data.errors.length - errorCount;

  function handleShowAST() {
    onShowAST(data.ast);
  }

  return (
    <div className='px-3 py-2'>
      <p>Ошибок: <b>{errorCount}</b> | Предупреждений: <b>{warningsCount}</b></p>
      {data.errors.map(error => {
        return (
        <p className='text-red'>
          <span className='font-semibold'>{error.isCritical ? 'Ошибка' : 'Предупреждение'} {getRSErrorPrefix(error)}: </span>
          <span>{getRSErrorMessage(error)}</span>
          </p>
        );
      })}
      {data.astText && 
      <p>
        <button type='button' 
          className='font-semibold underline text-primary'
          title='отобразить дерево разбора'
          onClick={handleShowAST}
        >
          Дерево разбора:
        </button>
        <span> {data.astText}</span>
      </p>}
    </div>
  )
}

export default ParsingResult;
