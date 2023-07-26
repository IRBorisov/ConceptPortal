import PrettyJson from '../../components/Common/PrettyJSON';
import { ExpressionParse } from '../../utils/models';

interface ParsingResultProps {
  data?: ExpressionParse
}

function ParsingResult({ data }: ParsingResultProps) {
  return (
    <div className='w-full px-3 py-2 mt-2 border'>
      <PrettyJson data={data} />
      {/* <textarea
          className={'leading-tight border shadow dark:bg-gray-800 '}
          rows={3}
          placeholder='Результаты анализа выражения'
          value={data}
      /> */}
    </div>
  )
}

export default ParsingResult;
