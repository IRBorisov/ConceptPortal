'use client';

import clsx from 'clsx';
import { useMemo } from 'react';
import { BiBug } from 'react-icons/bi';

import { ConceptLoader } from '@/components/Common/ConceptLoader';
import { useConceptTheme } from '@/context/ThemeContext';
import { ExpressionStatus } from '@/models/rsform';
import { type IConstituenta } from '@/models/rsform';
import { inferStatus } from '@/models/rsformAPI';
import { IExpressionParse, ParsingStatus } from '@/models/rslang';
import { colorbgCstStatus } from '@/utils/color';
import { labelExpressionStatus } from '@/utils/labels';

interface StatusBarProps {
  processing?: boolean
  isModified?: boolean
  parseData?: IExpressionParse
  constituenta?: IConstituenta
  onAnalyze: () => void
}

function StatusBar({ isModified, processing, constituenta, parseData, onAnalyze }: StatusBarProps) {
  const { colors } = useConceptTheme();
  const status = useMemo(() => {
    if (isModified) {
      return ExpressionStatus.UNKNOWN;
    }
    if (parseData) {
      const parse = parseData.parseResult ? ParsingStatus.VERIFIED : ParsingStatus.INCORRECT;
      return inferStatus(parse, parseData.valueClass);
    }
    return inferStatus(constituenta?.parse?.status, constituenta?.parse?.valueClass);
  }, [isModified, constituenta, parseData]);

  return (
  <div 
    title='Проверить определение [Ctrl + Q]'
    className={clsx(
      'w-[10rem] h-[1.75rem]',
      'px-3',
      'border',
      'select-none',
      'cursor-pointer',
      'duration-500 transition-colors'
    )}
    style={{backgroundColor: processing ? colors.bgDefault : colorbgCstStatus(status, colors)}}
    onClick={onAnalyze}
  >
    {processing ?
      <ConceptLoader size={3} /> :
      <div className='flex items-center justify-center h-full gap-2'>
        <BiBug size='1rem' className='translate-y-[0.1rem]' />
        <span className='font-semibold small-caps'>
          {labelExpressionStatus(status)}
        </span>
      </div>
    }
  </div>);
}

export default StatusBar;