import { prefixes } from '../../utils/constants';
import { mapStatusInfo } from '../../utils/staticUI';

interface CstStatusInfoProps {
  title?: string
}

function CstStatusInfo({ title }: CstStatusInfoProps) {
  return (
    <>
      { title && <h1>{title}</h1>}
      { [... mapStatusInfo.values()].map(
      (info, index) => {
        return (
        <p className='py-1' key={`${prefixes.cst_status_list}${index}`}>
          <span className={`inline-block font-semibold min-w-[4rem] text-center border ${info.color}`}>
            {info.text}
          </span>
          <span> - </span>
          <span>
            {info.tooltip}
          </span>
        </p>);
      })}
    </>
  );
}

export default CstStatusInfo;
