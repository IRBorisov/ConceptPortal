import { prefixes } from '../../utils/constants';
import { mapCstClassInfo } from '../../utils/staticUI';

interface CstClassInfoProps {
  title?: string
}

function CstClassInfo({ title }: CstClassInfoProps) {
  return (
    <div className='flex flex-col gap-1'>
      { title && <h1>{title}</h1>}
      { [... mapCstClassInfo.values()].map(
      (info, index) => {
        return (
        <p key={`${prefixes.cst_status_list}${index}`}>
          <span className={`px-1 inline-block font-semibold min-w-[6.5rem] text-center border ${info.color}`}>
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

export default CstClassInfo;
