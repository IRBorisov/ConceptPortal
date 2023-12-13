import { useConceptTheme } from '@/context/ThemeContext';
import { CstClass } from '@/models/rsform';
import { colorbgCstClass } from '@/utils/color';
import { prefixes } from '@/utils/constants';
import { describeCstClass, labelCstClass } from '@/utils/labels';

interface InfoCstClassProps {
  title?: string
}

function InfoCstClass({ title }: InfoCstClassProps) {
  const { colors } = useConceptTheme();

  return (
  <div className='flex flex-col gap-1 mb-2'>
    {title ? <h1>{title}</h1> : null}
    {Object.values(CstClass).map(
    (cclass, index) => {
      return (
      <p key={`${prefixes.cst_status_list}${index}`}>
        <span
          className='px-1 inline-block font-semibold min-w-[7rem] text-center border text-sm small-caps'
          style={{backgroundColor: colorbgCstClass(cclass, colors)}}
        >
          {labelCstClass(cclass)}
        </span>
        <span> - </span>
        <span>
          {describeCstClass(cclass)}
        </span>
      </p>);
    })}
  </div>);
}

export default InfoCstClass;
