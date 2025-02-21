import { Handle, Position } from 'reactflow';

import { type OssNodeInternal } from '../../../../models/ossLayout';

import { NodeCore } from './NodeCore';

export function InputNode(node: OssNodeInternal) {
  return (
    <>
      <NodeCore node={node} />
      <Handle type='source' position={Position.Bottom} />
    </>
  );
}
