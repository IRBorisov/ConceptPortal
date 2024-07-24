'use client';

import { ReactFlowProvider } from 'reactflow';

import useLocalStorage from '@/hooks/useLocalStorage';
import { storage } from '@/utils/constants';

import OssFlow from './OssFlow';

interface EditorOssGraphProps {
  isModified: boolean;
  setIsModified: React.Dispatch<React.SetStateAction<boolean>>;
}

function EditorOssGraph({ isModified, setIsModified }: EditorOssGraphProps) {
  const [showGrid, setShowGrid] = useLocalStorage<boolean>(storage.ossShowGrid, false);

  return (
    <ReactFlowProvider>
      <OssFlow isModified={isModified} setIsModified={setIsModified} showGrid={showGrid} setShowGrid={setShowGrid} />
    </ReactFlowProvider>
  );
}

export default EditorOssGraph;
