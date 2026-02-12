import clsx from 'clsx';

import { CstStatus } from '@/features/rsform';
import { colorBgCstStatus } from '@/features/rsform/colors';
import { describeExpressionStatus, labelExpressionStatus } from '@/features/rsform/labels';

import { prefixes } from '@/utils/constants';

interface InfoCstStatusProps {
  title?: string;
}

export function InfoCstStatus({ title }: InfoCstStatusProps) {
  return (
    <div className='flex flex-col gap-1 mb-2 dense'>
      {title ? <h1>{title}</h1> : null}
      {Object.values(CstStatus)
        .filter(status => status !== CstStatus.UNDEFINED)
        .map((status, index) => (
          <p key={`${prefixes.cst_status_list}${index}`}>
            <span
              className={clsx(
                'inline-block', //
                'min-w-28',
                'px-1',
                'border',
                'text-center text-sm font-controls'
              )}
              style={{ backgroundColor: colorBgCstStatus(status) }}
            >
              {labelExpressionStatus(status)}
            </span>
            <span> - </span>
            <span>{describeExpressionStatus(status)}</span>
          </p>
        ))}
    </div>
  );
}
