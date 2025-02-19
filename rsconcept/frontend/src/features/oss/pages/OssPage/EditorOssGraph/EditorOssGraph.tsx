'use client';

import { ReactFlowProvider } from 'reactflow';

import { OssFlow } from './OssFlow';

export function EditorOssGraph() {
  return (
    <ReactFlowProvider>
      <OssFlow />
    </ReactFlowProvider>
  );
}
