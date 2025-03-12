import { CstClass } from '@/features/rsform';
import { colorBgCstClass } from '@/features/rsform/colors';
import { describeCstClass, labelCstClass } from '@/features/rsform/labels';

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
              className='inline-block min-w-28 px-1 border text-center text-sm font-controls'
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
