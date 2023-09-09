import { useConceptTheme } from '../../context/ThemeContext';
import { prefixes } from '../../utils/constants';
import { getCstStatusBgColor, mapStatusInfo } from '../../utils/staticUI';

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
            className='px-1 inline-block font-semibold min-w-[5rem] text-center border text-sm'
            style={{backgroundColor: getCstStatusBgColor(status, colors)}}
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
