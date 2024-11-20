'use client';

import { ReactFlowProvider } from 'reactflow';

import OssFlow from './OssFlow';

interface EditorOssGraphProps {
  isModified: boolean;
  setIsModified: (newValue: boolean) => void;
}

function EditorOssGraph({ isModified, setIsModified }: EditorOssGraphProps) {
  return (
    <ReactFlowProvider>
      <OssFlow isModified={isModified} setIsModified={setIsModified} />
    </ReactFlowProvider>
  );
}

export default EditorOssGraph;
