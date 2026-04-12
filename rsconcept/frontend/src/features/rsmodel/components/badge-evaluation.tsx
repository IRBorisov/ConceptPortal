'use client';

import { type Constituenta, type RSEngine } from '@/domain/library';
import { globalIDs } from '@/utils/constants';

import { colorFgEvalStatus } from '../colors';
import { useCstStatus } from '../hooks/use-cst-status';
import { useCstValue } from '../hooks/use-cst-value';
import { labelEvalStatus, labelValue } from '../labels';

interface BadgeEvaluationProps {
  engine: RSEngine;
  cst: Constituenta;
}

/** Displays a badge with value cardinality and information tooltip. */
export function BadgeEvaluation({ engine, cst }: BadgeEvaluationProps) {
  const value = useCstValue(engine, cst);
  const status = useCstStatus(engine, cst);
  return (
    <div
      className='font-math text-md'
      style={{
        color: colorFgEvalStatus(status)
      }}
      data-tooltip-id={globalIDs.tooltip}
      data-tooltip-content={labelEvalStatus(status)}
    >
      {labelValue(value, cst.analysis.type)}
    </div>
  );
}
