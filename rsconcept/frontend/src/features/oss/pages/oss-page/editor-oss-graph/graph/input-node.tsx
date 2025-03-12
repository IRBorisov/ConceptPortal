import { Handle, Position } from 'reactflow';

import { type OssNodeInternal } from '../../../../models/oss-layout';

import { NodeCore } from './node-core';

export function InputNode(node: OssNodeInternal) {
  return (
    <>
      <NodeCore node={node} />
      <Handle type='source' position={Position.Bottom} />
    </>
  );
}
