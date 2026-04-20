import { type Block, NodeType, type OperationSchema, OperationType } from '@/domain/library';

import { ViewOssStats } from '@/features/oss/components/view-oss-stats';

interface BlockStatsProps {
  target: Block;
  oss: OperationSchema;
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
    count_owned: operations.filter(
      item => !!item.result && (item.operation_type !== OperationType.INPUT || !item.is_import)
    ).length,
    count_block: contents.length - operations.length,
    count_references: operations.filter(item => item.operation_type === OperationType.REPLICA).length
  };

  return <ViewOssStats stats={blockStats} className='pr-6 py-2 -ml-4' />;
}
