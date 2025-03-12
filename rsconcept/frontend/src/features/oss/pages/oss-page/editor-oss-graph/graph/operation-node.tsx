'use client';

import { Handle, Position } from 'reactflow';

import { type OssNodeInternal } from '../../../../models/oss-layout';

import { NodeCore } from './node-core';

export function OperationNode(node: OssNodeInternal) {
  return (
    <>
      <Handle type='target' position={Position.Top} id='left' style={{ left: 40 }} />
      <Handle type='target' position={Position.Top} id='right' style={{ right: 40, left: 'auto' }} />
      <NodeCore node={node} />
      <Handle type='source' position={Position.Bottom} />
    </>
  );
}
