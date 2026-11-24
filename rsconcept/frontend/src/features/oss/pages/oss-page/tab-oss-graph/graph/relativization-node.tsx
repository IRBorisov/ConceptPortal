'use client';

import { Handle, type NodeProps, Position } from '@xyflow/react';

import { NodeCoreComponent } from './node-core';
import { type OGOperationNode } from './og-models';

export function RelativizationNode(node: NodeProps<OGOperationNode>) {
  return (
    <>
      <Handle type='target' position={Position.Top} id='left' isConnectable={false} />
      <NodeCoreComponent node={node} />
      <Handle type='source' position={Position.Bottom} isConnectableStart />
    </>
  );
}
