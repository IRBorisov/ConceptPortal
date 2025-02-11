'use client';

import clsx from 'clsx';

import { StatusIcon } from '@/components/DomainIcons';
import { Loader } from '@/components/Loader';
import { APP_COLORS, colorStatusBar } from '@/styling/color';
import { globals } from '@/utils/constants';
import { prepareTooltip } from '@/utils/utils';

import { labelExpressionStatus } from '../../../labels';
import { ExpressionStatus, IConstituenta } from '../../../models/rsform';
import { inferStatus } from '../../../models/rsformAPI';
import { IExpressionParse, ParsingStatus } from '../../../models/rslang';

interface StatusBarProps {
  processing?: boolean;
  isModified?: boolean;
  parseData?: IExpressionParse;
  activeCst: IConstituenta;
  onAnalyze: () => void;
}

function StatusBar({ isModified, processing, activeCst, parseData, onAnalyze }: StatusBarProps) {
  const status = (() => {
    if (isModified) {
      return ExpressionStatus.UNKNOWN;
    }
    if (parseData) {
      const parse = parseData.parseResult ? ParsingStatus.VERIFIED : ParsingStatus.INCORRECT;
      return inferStatus(parse, parseData.valueClass);
    }
    return inferStatus(activeCst.parse.status, activeCst.parse.valueClass);
  })();

  return (
    <div
      tabIndex={0}
      className={clsx(
        'w-[10rem] h-[1.75rem]',
        'px-2 flex items-center justify-center',
        'border',
        'select-none',
        'cursor-pointer',
        'focus-frame',
        'transition-colors duration-500'
      )}
      style={{ backgroundColor: processing ? APP_COLORS.bgDefault : colorStatusBar(status) }}
      data-tooltip-id={globals.tooltip}
      data-tooltip-html={prepareTooltip('Проверить определение', 'Ctrl + Q')}
      onClick={onAnalyze}
    >
      {processing ? (
        <div className='cc-fade-in'>
          {' '}
          <Loader scale={3} />
        </div>
      ) : null}
      {!processing ? (
        <div className='cc-fade-in flex items-center gap-2'>
          <StatusIcon size='1rem' value={status} />
          <span className='pb-[0.125rem] font-controls pr-2'>{labelExpressionStatus(status)}</span>
        </div>
      ) : null}
    </div>
  );
}

export default StatusBar;
