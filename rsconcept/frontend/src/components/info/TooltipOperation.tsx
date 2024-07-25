import Tooltip from '@/components/ui/Tooltip';
import { IOperation } from '@/models/oss';
import { labelOperationType } from '@/utils/labels';

interface TooltipOperationProps {
  data: IOperation;
  anchor: string;
}

function TooltipOperation({ data, anchor }: TooltipOperationProps) {
  return (
    <Tooltip layer='z-modalTooltip' anchorSelect={anchor} className='max-w-[30rem] dense'>
      <h2>Операция {data.alias}</h2>
      <p>
        <b>Тип:</b> {labelOperationType(data.operation_type)}
      </p>
      {data.title ? (
        <p>
          <b>Название: </b>
          {data.title}
        </p>
      ) : null}
      {data.comment ? (
        <p>
          <b>Комментарий: </b>
          {data.comment}
        </p>
      ) : null}
    </Tooltip>
  );
}

export default TooltipOperation;
