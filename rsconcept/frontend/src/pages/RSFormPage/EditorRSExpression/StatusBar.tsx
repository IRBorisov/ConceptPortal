'use client';

import clsx from 'clsx';
import { useMemo } from 'react';

import { ConceptLoader } from '@/components/Common/ConceptLoader';
import { useConceptTheme } from '@/context/ThemeContext';
import { ExpressionStatus } from '@/models/rsform';
import { type IConstituenta } from '@/models/rsform';
import { inferStatus } from '@/models/rsformAPI';
import { IExpressionParse, ParsingStatus } from '@/models/rslang';
import { colorBgCstStatus } from '@/utils/color';
import { globalIDs } from '@/utils/constants';
import { labelExpressionStatus } from '@/utils/labels';

import StatusIcon from './StatusIcon';

interface StatusBarProps {
  processing?: boolean;
  isModified?: boolean;
  parseData?: IExpressionParse;
  constituenta?: IConstituenta;
  onAnalyze: () => void;
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
      className={clsx(
        'w-[10rem] h-[1.75rem]',
        'px-2 flex items-center justify-center gap-2',
        'border',
        'select-none',
        'cursor-pointer',
        'duration-500 transition-colors'
      )}
      style={{ backgroundColor: processing ? colors.bgDefault : colorBgCstStatus(status, colors) }}
      data-tooltip-id={globalIDs.tooltip}
      data-tooltip-content='Проверить определение [Ctrl + Q]'
      onClick={onAnalyze}
    >
      {processing ? (
        <ConceptLoader size={3} />
      ) : (
        <>
          <StatusIcon status={status} />
          <span className='pb-[0.125rem] font-controls pr-2'>{labelExpressionStatus(status)}</span>
        </>
      )}
    </div>
  );
}

export default StatusBar;
