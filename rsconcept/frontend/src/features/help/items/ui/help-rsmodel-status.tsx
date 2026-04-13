import clsx from 'clsx';

import { EvalStatus } from '@/domain/library';

import { colorStatusBar } from '@/features/rsmodel/colors';
import { describeEvalStatus, labelEvalStatus } from '@/features/rsmodel/labels';

import { prefixes } from '@/utils/constants';

const statusOrder = [
  EvalStatus.NO_EVAL,
  EvalStatus.NOT_PROCESSED,
  EvalStatus.INVALID_DATA,
  EvalStatus.EVAL_FAIL,
  EvalStatus.AXIOM_FALSE,
  EvalStatus.EMPTY,
  EvalStatus.HAS_DATA
] as const;

export function HelpRSModelStatus() {
  return (
    <div className='dense mb-2'>
      <h1>Статусы вычисления</h1>
      <div className='flex flex-col gap-1 dense'>
        {statusOrder.map(status => (
          <p key={`${prefixes.eval_status_list}${status}`}>
            <span
              className={clsx(
                'inline-block', //
                'min-w-35',
                'px-1',
                'border',
                'text-center text-sm font-controls'
              )}
              style={{ backgroundColor: colorStatusBar(status) }}
            >
              {labelEvalStatus(status)}
            </span>
            <span> - </span>
            <span>{describeEvalStatus(status)}</span>
          </p>
        ))}
      </div>
    </div>
  );
}
