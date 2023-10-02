import { useConceptTheme } from '../../context/ThemeContext';
import { ExpressionStatus } from '../../models/rsform';
import { colorbgCstStatus } from '../../utils/color';
import { prefixes } from '../../utils/constants';
import { describeExpressionStatus, labelExpressionStatus } from '../../utils/labels';

interface InfoCstStatusProps {
  title?: string
}

function InfoCstStatus({ title }: InfoCstStatusProps) {
  const { colors } = useConceptTheme();

  return (
    <div className='flex flex-col gap-1'>
      { title && <h1>{title}</h1>}
      { Object.values(ExpressionStatus)
        .filter(status => status !== ExpressionStatus.UNDEFINED)
        .map(
        (status, index) => {
          return (
          <p key={`${prefixes.cst_status_list}${index}`}>
            <span
              className='px-1 inline-block font-semibold min-w-[7rem] text-center border text-sm'
              style={{backgroundColor: colorbgCstStatus(status, colors)}}
            >
              {labelExpressionStatus(status)}
            </span>
            <span> - </span>
            <span>
              {describeExpressionStatus(status)}
            </span>
          </p>);
        }
      )}
    </div>
  );
}

export default InfoCstStatus;
