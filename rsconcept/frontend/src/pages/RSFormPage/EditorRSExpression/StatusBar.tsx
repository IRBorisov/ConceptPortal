'use client';

import clsx from 'clsx';
import { AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

import Loader from '@/components/ui/Loader';
import { useConceptOptions } from '@/context/OptionsContext';
import { ExpressionStatus } from '@/models/rsform';
import { type IConstituenta } from '@/models/rsform';
import { inferStatus } from '@/models/rsformAPI';
import { IExpressionParse, ParsingStatus } from '@/models/rslang';
import { colorBgCstStatus } from '@/styling/color';
import { globals } from '@/utils/constants';
import { labelExpressionStatus, prepareTooltip } from '@/utils/labels';

import StatusIcon from './StatusIcon';

interface StatusBarProps {
  processing?: boolean;
  isModified?: boolean;
  parseData?: IExpressionParse;
  constituenta?: IConstituenta;
  onAnalyze: () => void;
}

function StatusBar({ isModified, processing, constituenta, parseData, onAnalyze }: StatusBarProps) {
  const { colors } = useConceptOptions();
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
      tabIndex={-1}
      className={clsx(
        'w-[10rem] h-[1.75rem]',
        'px-2 flex items-center justify-center gap-2',
        'border',
        'select-none',
        'cursor-pointer',
        'duration-500 transition-colors'
      )}
      style={{ backgroundColor: processing ? colors.bgDefault : colorBgCstStatus(status, colors) }}
      data-tooltip-id={globals.tooltip}
      data-tooltip-html={prepareTooltip('Проверить определение', 'Ctrl + Q')}
      onClick={onAnalyze}
    >
      <AnimatePresence mode='wait'>
        {processing ? <Loader key='status-loader' size={3} /> : null}
        {!processing ? (
          <>
            <StatusIcon key='status-icon' status={status} />
            <span key='status-text' className='pb-[0.125rem] font-controls pr-2'>
              {labelExpressionStatus(status)}
            </span>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default StatusBar;
