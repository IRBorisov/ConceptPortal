'use client';

import clsx from 'clsx';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';

import { Loader } from '@/components/loader';
import { cn } from '@/components/utils';
import { APP_COLORS } from '@/styling/colors';
import { globalIDs } from '@/utils/constants';
import { type RO } from '@/utils/meta';
import { isMac, prepareTooltip } from '@/utils/utils';

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
  parseData: RO<IExpressionParseDTO> | null;
  activeCst: IConstituenta;
  onAnalyze: () => void;
}

export function StatusBar({ className, isModified, processing, activeCst, parseData, onAnalyze }: StatusBarProps) {
  const status = (() => {
    console.log(isModified, !activeCst.parse);
    if (isModified || !activeCst.parse) {
      return ExpressionStatus.UNKNOWN;
    }
    if (parseData) {
      const parse = parseData.parseResult ? ParsingStatus.VERIFIED : ParsingStatus.INCORRECT;
      return inferStatus(parse, parseData.valueClass);
    }
    return inferStatus(activeCst.parse.status, activeCst.parse.valueClass);
  })();

  return (
    <div className={cn('pl-22 xs:pl-8 flex gap-1', className)}>
      <div
        tabIndex={0}
        className={clsx(
          'w-32 h-7',
          'px-2 flex items-center justify-center',
          'border',
          'select-none',
          'cursor-pointer',
          'focus-frame outline-none',
          'transition-colors duration-fade'
        )}
        style={{ backgroundColor: processing ? APP_COLORS.bgDefault : colorStatusBar(status) }}
        data-tooltip-id={globalIDs.tooltip}
        data-tooltip-html={prepareTooltip('Проверить определение', isMac() ? 'Cmd + Q' : 'Ctrl + Q')}
        onClick={onAnalyze}
      >
        {processing ? (
          <div className='cc-fade-in'>
            <Loader scale={3} />
          </div>
        ) : null}
        {!processing ? (
          <div className='cc-fade-in flex items-center gap-1'>
            <IconExpressionStatus size='1rem' value={status} />
            <span className='font-controls pr-1 text-sm'>{labelExpressionStatus(status)}</span>
          </div>
        ) : null}
      </div>
      <BadgeHelp topic={HelpTopic.UI_CST_STATUS} offset={4} />
    </div>
  );
}
