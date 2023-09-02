import { useConceptTheme } from '../../context/ThemeContext';
import { prefixes } from '../../utils/constants';
import { getCstClassColor, mapCstClassInfo } from '../../utils/staticUI';

interface InfoCstClassProps {
  title?: string
}

function InfoCstClass({ title }: InfoCstClassProps) {
  const { colors } = useConceptTheme();

  return (
    <div className='flex flex-col gap-1'>
      { title && <h1>{title}</h1>}
      { [... mapCstClassInfo.entries()].map(
      ([cstClass, info], index) => {
        return (
        <p key={`${prefixes.cst_status_list}${index}`}>
          <span
            className='px-1 inline-block font-semibold min-w-[7rem] text-center border'
            style={{backgroundColor: getCstClassColor(cstClass, colors)}}
          
          >
            {info.text}
          </span>
          <span> - </span>
          <span>
            {info.tooltip}
          </span>
        </p>);
      })}
    </div>
  );
}

export default InfoCstClass;
