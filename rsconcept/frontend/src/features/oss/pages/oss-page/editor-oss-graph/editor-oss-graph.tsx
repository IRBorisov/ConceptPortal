'use client';

import { ReactFlowProvider } from 'reactflow';

import { OssFlow } from './oss-flow';

export function EditorOssGraph() {
  return (
    <ReactFlowProvider>
      <OssFlow />
    </ReactFlowProvider>
  );
}
