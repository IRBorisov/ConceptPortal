import { Handle, type NodeProps, Position } from '@xyflow/react';

import { NodeCoreComponent } from './node-core';
import { type OGOperationNode } from './og-models';

export function ReplicaNode(node: NodeProps<OGOperationNode>) {
  return (
    <>
      <NodeCoreComponent node={node} />
      <Handle type='source' position={Position.Bottom} className='-translate-y-px' isConnectableStart />
    </>
  );
}
