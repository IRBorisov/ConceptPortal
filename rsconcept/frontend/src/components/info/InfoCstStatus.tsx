import clsx from 'clsx';

import { ExpressionStatus } from '@/models/rsform';
import { colorBgCstStatus } from '@/styling/color';
import { prefixes } from '@/utils/constants';
import { describeExpressionStatus, labelExpressionStatus } from '@/utils/labels';

interface InfoCstStatusProps {
  title?: string;
}

function InfoCstStatus({ title }: InfoCstStatusProps) {
  return (
    <div className='flex flex-col gap-1 mb-2 dense'>
      {title ? <h1>{title}</h1> : null}
      {Object.values(ExpressionStatus)
        .filter(status => status !== ExpressionStatus.UNDEFINED)
        .map((status, index) => (
          <p key={`${prefixes.cst_status_list}${index}`}>
            <span
              className={clsx(
                'inline-block', // prettier: split lines
                'min-w-[7rem]',
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

export default InfoCstStatus;
