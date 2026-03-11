'use client';

import { ReactFlowProvider } from '@xyflow/react';

import { OssFlow } from './oss-flow';
import { OssFlowState } from './oss-flow-state';

export function TabOssGraph() {
  return (
    <ReactFlowProvider>
      <OssFlowState>
        <OssFlow />
      </OssFlowState>
    </ReactFlowProvider>
  );
}
