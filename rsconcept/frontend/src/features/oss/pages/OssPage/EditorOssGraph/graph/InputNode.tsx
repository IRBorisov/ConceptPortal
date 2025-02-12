import { Handle, Position } from 'reactflow';

import { OssNodeInternal } from '../../../../models/ossLayout';

import NodeCore from './NodeCore';

function InputNode(node: OssNodeInternal) {
  return (
    <>
      <NodeCore node={node} />
      <Handle type='source' position={Position.Bottom} />
    </>
  );
}

export default InputNode;
