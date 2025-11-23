import { Handle, type NodeProps, Position } from '@xyflow/react';

import { NodeCoreComponent } from './node-core';
import { type OGOperationNode } from './og-models';

export function InputNodeComponent(node: NodeProps<OGOperationNode>) {
  return (
    <>
      <NodeCoreComponent node={node} />
      <Handle type='source' position={Position.Bottom} className='-translate-y-px' />
    </>
  );
}
