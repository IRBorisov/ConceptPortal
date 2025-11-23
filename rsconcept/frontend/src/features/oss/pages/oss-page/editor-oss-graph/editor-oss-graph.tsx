'use client';

import { ReactFlowProvider } from '@xyflow/react';

import { OssFlow } from './oss-flow';
import { OssFlowState } from './oss-flow-state';

export function EditorOssGraph() {
  return (
    <ReactFlowProvider>
      <OssFlowState>
        <OssFlow />
      </OssFlowState>
    </ReactFlowProvider>
  );
}
