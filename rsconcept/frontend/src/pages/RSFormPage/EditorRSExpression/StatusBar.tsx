'use client';

import { animated, useTransition } from '@react-spring/web';
import clsx from 'clsx';
import { useMemo, useState } from 'react';

import { StatusIcon } from '@/components/DomainIcons';
import Loader from '@/components/ui/Loader';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { ExpressionStatus } from '@/models/rsform';
import { type IConstituenta } from '@/models/rsform';
import { inferStatus } from '@/models/rsformAPI';
import { IExpressionParse, ParsingStatus } from '@/models/rslang';
import { colorStatusBar } from '@/styling/color';
import { globals, PARAMETER } from '@/utils/constants';
import { labelExpressionStatus, prepareTooltip } from '@/utils/labels';

interface StatusBarProps {
  processing?: boolean;
  isModified?: boolean;
  parseData?: IExpressionParse;
  activeCst: IConstituenta;
  onAnalyze: () => void;
}

function StatusBar({ isModified, processing, activeCst, parseData, onAnalyze }: StatusBarProps) {
  const { colors } = useConceptOptions();
  const status = useMemo(() => {
    if (isModified) {
      return ExpressionStatus.UNKNOWN;
    }
    if (parseData) {
      const parse = parseData.parseResult ? ParsingStatus.VERIFIED : ParsingStatus.INCORRECT;
      return inferStatus(parse, parseData.valueClass);
    }
    return inferStatus(activeCst.parse.status, activeCst.parse.valueClass);
  }, [isModified, activeCst, parseData]);

  const [isAnimating, setIsAnimating] = useState(false);
  const transitions = useTransition(processing, {
    from: { opacity: 1 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    onStart: () => setIsAnimating(true),
    onRest: () => setIsAnimating(false),
    config: { duration: PARAMETER.fadeDuration }
  });

  return (
    <div
      tabIndex={0}
      className={clsx(
        'w-[10rem] h-[1.75rem]',
        'px-2 flex items-center justify-center gap-2',
        'border',
        'select-none',
        'cursor-pointer',
        'focus-frame',
        'transition-colors duration-500'
      )}
      style={{ backgroundColor: processing ? colors.bgDefault : colorStatusBar(status, colors) }}
      data-tooltip-id={globals.tooltip}
      data-tooltip-html={prepareTooltip('Проверить определение', 'Ctrl + Q')}
      onClick={onAnalyze}
    >
      {transitions((style, flag) =>
        flag ? (
          <animated.div style={style}>
            <Loader scale={3} />
          </animated.div>
        ) : null
      )}
      {!processing && !isAnimating ? (
        <>
          <StatusIcon size='1rem' value={status} />
          <span className='pb-[0.125rem] font-controls pr-2'>{labelExpressionStatus(status)}</span>
        </>
      ) : null}
    </div>
  );
}

export default StatusBar;
