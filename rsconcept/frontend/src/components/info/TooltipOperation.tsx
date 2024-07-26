import Tooltip from '@/components/ui/Tooltip';
import { OssNodeInternal } from '@/models/miscellaneous';
import { labelOperationType } from '@/utils/labels';

interface TooltipOperationProps {
  node: OssNodeInternal;
  anchor: string;
}

function TooltipOperation({ node, anchor }: TooltipOperationProps) {
  return (
    <Tooltip layer='z-modalTooltip' anchorSelect={anchor} className='max-w-[35rem] max-h-[40rem] dense my-3'>
      <h2>{node.data.operation.alias}</h2>
      <p>
        <b>Тип:</b> {labelOperationType(node.data.operation.operation_type)}
      </p>
      {node.data.operation.title ? (
        <p>
          <b>Название: </b>
          {node.data.operation.title}
        </p>
      ) : null}
      {node.data.operation.comment ? (
        <p>
          <b>Комментарий: </b>
          {node.data.operation.comment}
        </p>
      ) : null}
      <p>
        <b>Положение:</b> [{node.xPos}, {node.yPos}]
      </p>
    </Tooltip>
  );
}

export default TooltipOperation;
