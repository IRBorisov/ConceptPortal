import { OperationType } from '../../../../backend/types';
import { OssStats } from '../../../../components/oss-stats';
import { type IBlock, type IOperationSchema, NodeType } from '../../../../models/oss';

interface BlockStatsProps {
  target: IBlock;
  oss: IOperationSchema;
}

export function BlockStats({ target, oss }: BlockStatsProps) {
  const contents = oss.hierarchy.expandAllOutputs([target.nodeID]);
  const items = contents.map(item => oss.itemByNodeID.get(item)).filter(item => !!item);
  const operations = items.filter(item => item.nodeType === NodeType.OPERATION);
  const blockStats = {
    count_all: contents.length,
    count_inputs: operations.filter(item => item.operation_type === OperationType.INPUT).length,
    count_synthesis: operations.filter(item => item.operation_type === OperationType.SYNTHESIS).length,
    count_schemas: operations.filter(item => !!item.result).length,
    count_owned: operations.filter(item => !!item.result && !item.is_import).length,
    count_block: contents.length - operations.length
  };

  return <OssStats stats={blockStats} className='pr-3' />;
}
