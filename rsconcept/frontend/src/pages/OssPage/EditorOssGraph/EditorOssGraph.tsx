'use client';

import { ReactFlowProvider } from 'reactflow';

import OssFlow from './OssFlow';

function EditorOssGraph() {
  return (
    <ReactFlowProvider>
      <OssFlow />
    </ReactFlowProvider>
  );
}

export default EditorOssGraph;
