import clsx from 'clsx';

import { useConceptTheme } from '@/context/ThemeContext';
import { ExpressionStatus } from '@/models/rsform';
import { colorBgCstStatus } from '@/utils/color';
import { prefixes } from '@/utils/constants';
import { describeExpressionStatus, labelExpressionStatus } from '@/utils/labels';

interface InfoCstStatusProps {
  title?: string;
}

function InfoCstStatus({ title }: InfoCstStatusProps) {
  const { colors } = useConceptTheme();

  return (
    <div className='flex flex-col gap-1 mb-2'>
      {title ? <h1>{title}</h1> : null}
      {Object.values(ExpressionStatus)
        .filter(status => status !== ExpressionStatus.UNDEFINED)
        .map((status, index) => (
          <p key={`${prefixes.cst_status_list}${index}`}>
            <span
              className={clsx(
                'inline-block',
                'min-w-[7rem]',
                'px-1',
                'border',
                'text-center text-sm small-caps font-semibold'
              )}
              style={{ backgroundColor: colorBgCstStatus(status, colors) }}
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
