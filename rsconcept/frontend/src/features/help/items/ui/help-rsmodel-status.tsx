import clsx from 'clsx';

import { useTx } from '@/i18n';
import { EvalStatus } from '@rsconcept/domain/library';

import { colorBgEvalStatus } from '@/features/rsmodel/colors';
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
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.evaluation.status')}</h1>
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
              style={{ backgroundColor: colorBgEvalStatus(status) }}
            >
              {labelEvalStatus(status)}
            </span>
            <span> - </span>
            <span>{describeEvalStatus(status).toLocaleLowerCase()}</span>
          </p>
        ))}
      </div>
    </>
  );
}
