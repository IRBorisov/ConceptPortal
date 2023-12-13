'use client';

import Button from '@/components/Common/Button';
import { ConceptLoader } from '@/components/Common/ConceptLoader';
import { IConstituenta } from '@/models/rsform';
import { IExpressionParse, IRSErrorDescription } from '@/models/rslang';

import ParsingResult from './ParsingResult';
import StatusBar from './StatusBar';

interface RSAnalyzerProps {
  parseData?: IExpressionParse
  processing?: boolean

  activeCst?: IConstituenta
  isModified: boolean
  disabled?: boolean
  
  onCheckExpression: () => void
  onShowError: (error: IRSErrorDescription) => void
}

function RSAnalyzer({
  parseData, processing,
  activeCst, disabled, isModified,
  onCheckExpression, onShowError,
}: RSAnalyzerProps) {
  return (
  <div className='w-full max-h-[4.5rem] min-h-[4.5rem] flex'>
    <div className='flex flex-col text-sm'>
      <Button noOutline
        text='Проверить'
        tooltip='Проверить формальное определение'
        dimensions='w-[6.75rem] min-h-[3rem] z-pop rounded-none'
        colors='clr-btn-default'
        onClick={() => onCheckExpression()}
      />
      <StatusBar
        isModified={isModified}
        constituenta={activeCst}
        parseData={parseData}
      />
    </div>
    <div className='w-full overflow-y-auto text-sm border rounded-none'>
      {processing ? <ConceptLoader size={6} /> : null}
      {(!processing && parseData) ? 
      <ParsingResult
        data={parseData}
        disabled={disabled}
        onShowError={onShowError}
      /> : null}
      {(!processing && !parseData) ?
      <input disabled
        className='w-full px-2 py-1 text-base select-none h-fit clr-app'
        placeholder='Результаты проверки выражения'
      /> : null}
    </div>
  </div>);
}

export default RSAnalyzer;