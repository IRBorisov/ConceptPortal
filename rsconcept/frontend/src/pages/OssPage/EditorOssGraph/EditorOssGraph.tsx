'use client';

import { ReactFlowProvider } from 'reactflow';

import OssFlow from './OssFlow';

interface EditorOssGraphProps {
  isModified: boolean;
  setIsModified: React.Dispatch<React.SetStateAction<boolean>>;
}

function EditorOssGraph({ isModified, setIsModified }: EditorOssGraphProps) {
  return (
    <ReactFlowProvider>
      <OssFlow isModified={isModified} setIsModified={setIsModified} />
    </ReactFlowProvider>
  );
}

export default EditorOssGraph;
