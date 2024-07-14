'use client';

import { ReactFlowProvider } from 'reactflow';

import AnimateFade from '@/components/wrap/AnimateFade';

import { useOssEdit } from '../OssEditContext';
import OssFlow from './OssFlow';

function EditorOssGraph() {
  const controller = useOssEdit();

  return (
    <ReactFlowProvider>
      <AnimateFade>
        <OssFlow controller={controller} />
      </AnimateFade>
    </ReactFlowProvider>
  );
}

export default EditorOssGraph;
