'use client';

import { type Constituenta } from '@/features/rsform';

import { globalIDs } from '@/utils/constants';

import { colorFgEvalStatus } from '../colors';
import { useCstValue } from '../hooks/use-cst-value';
import { labelEvalStatus, labelValue } from '../labels';
import { type EvalStatus, type RSModel } from '../models/rsmodel';

interface BadgeEvaluationProps {
  model: RSModel;
  cst: Constituenta;
  status: EvalStatus;
}

/** Displays a badge with value cardinality and information tooltip. */
export function BadgeEvaluation({ model, cst, status }: BadgeEvaluationProps) {
  const value = useCstValue(model, cst);
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
