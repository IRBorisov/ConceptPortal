import { useConceptTheme } from '../../context/ThemeContext';
import { prefixes } from '../../utils/constants';
import { getCstStatusColor, mapStatusInfo } from '../../utils/staticUI';

interface InfoCstStatusProps {
  title?: string
}

function InfoCstStatus({ title }: InfoCstStatusProps) {
  const { colors } = useConceptTheme();

  return (
    <div className='flex flex-col gap-1'>
      { title && <h1>{title}</h1>}
      { [... mapStatusInfo.entries()].map(
      ([status, info], index) => {
        return (
        <p key={`${prefixes.cst_status_list}${index}`}>
          <span
            className='px-1 inline-block font-semibold min-w-[4rem] text-center border'
            style={{backgroundColor: getCstStatusColor(status, colors)}}
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

export default InfoCstStatus;
