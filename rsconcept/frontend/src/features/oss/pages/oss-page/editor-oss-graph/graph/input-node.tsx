import { Handle, Position } from 'reactflow';

import { type OperationInternalNode } from '../../../../models/oss-layout';

import { NodeCore } from './node-core';

export function InputNode(node: OperationInternalNode) {
  return (
    <>
      <NodeCore node={node} />
      <Handle type='source' position={Position.Bottom} />
    </>
  );
}
