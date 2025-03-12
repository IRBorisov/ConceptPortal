'use client';

import clsx from 'clsx';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components';

import { Loader } from '@/components/loader';
import { APP_COLORS } from '@/styling/colors';
import { globalIDs } from '@/utils/constants';
import { prepareTooltip } from '@/utils/utils';

import { type IExpressionParseDTO, ParsingStatus } from '../../../backend/types';
import { colorStatusBar } from '../../../colors';
import { IconExpressionStatus } from '../../../components/icon-expression-status';
import { labelExpressionStatus } from '../../../labels';
import { ExpressionStatus, type IConstituenta } from '../../../models/rsform';
import { inferStatus } from '../../../models/rsform-api';

interface StatusBarProps {
  className?: string;
  processing: boolean;
  isModified: boolean;
  parseData: IExpressionParseDTO | null;
  activeCst: IConstituenta;
  onAnalyze: () => void;
}

export function StatusBar({ className, isModified, processing, activeCst, parseData, onAnalyze }: StatusBarProps) {
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
    <div className={clsx('pl-34 xs:pl-8 flex gap-1', className)}>
      <div
        tabIndex={0}
        className={clsx(
          'w-40 h-7',
          'px-2 flex items-center justify-center',
          'border',
          'select-none',
          'cursor-pointer',
          'focus-frame outline-none',
          'transition-colors duration-500'
        )}
        style={{ backgroundColor: processing ? APP_COLORS.bgDefault : colorStatusBar(status) }}
        data-tooltip-id={globalIDs.tooltip}
        data-tooltip-html={prepareTooltip('Проверить определение', 'Ctrl + Q')}
        onClick={onAnalyze}
      >
        {processing ? (
          <div className='cc-fade-in'>
            <Loader scale={3} />
          </div>
        ) : null}
        {!processing ? (
          <div className='cc-fade-in flex items-center gap-2'>
            <IconExpressionStatus size='1rem' value={status} />
            <span className='pb-0.5 font-controls pr-2'>{labelExpressionStatus(status)}</span>
          </div>
        ) : null}
      </div>
      <BadgeHelp topic={HelpTopic.UI_CST_STATUS} offset={4} />
    </div>
  );
}
