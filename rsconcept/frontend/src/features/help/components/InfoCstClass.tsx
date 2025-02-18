import clsx from 'clsx';

import { colorBgCstClass } from '@/features/rsform/colors';
import { describeCstClass, labelCstClass } from '@/features/rsform/labels';
import { CstClass } from '@/features/rsform/models/rsform';

import { prefixes } from '@/utils/constants';

interface InfoCstClassProps {
  header?: string;
}

export function InfoCstClass({ header }: InfoCstClassProps) {
  return (
    <div className='flex flex-col gap-1 mb-2 dense'>
      {header ? <h1>{header}</h1> : null}
      {Object.values(CstClass).map((cstClass, index) => {
        return (
          <p key={`${prefixes.cst_status_list}${index}`}>
            <span
              className={clsx('inline-block', 'min-w-[7rem]', 'px-1', 'border', 'text-center text-sm font-controls')}
              style={{ backgroundColor: colorBgCstClass(cstClass) }}
            >
              {labelCstClass(cstClass)}
            </span>
            <span> - </span>
            <span>{describeCstClass(cstClass)}</span>
          </p>
        );
      })}
    </div>
  );
}
