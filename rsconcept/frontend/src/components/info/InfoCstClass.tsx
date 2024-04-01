import clsx from 'clsx';

import { useConceptTheme } from '@/context/ThemeContext';
import { CstClass } from '@/models/rsform';
import { colorBgCstClass } from '@/styling/color';
import { prefixes } from '@/utils/constants';
import { describeCstClass, labelCstClass } from '@/utils/labels';

interface InfoCstClassProps {
  header?: string;
}

function InfoCstClass({ header }: InfoCstClassProps) {
  const { colors } = useConceptTheme();

  return (
    <div className='flex flex-col gap-1 mb-2 dense'>
      {header ? <h1>{header}</h1> : null}
      {Object.values(CstClass).map((cstClass, index) => {
        return (
          <p key={`${prefixes.cst_status_list}${index}`}>
            <span
              className={clsx('inline-block', 'min-w-[7rem]', 'px-1', 'border', 'text-center text-sm font-controls')}
              style={{ backgroundColor: colorBgCstClass(cstClass, colors) }}
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

export default InfoCstClass;
