'use client';

import { ReactFlowProvider } from '@reactflow/core';

import SynthesisFlow from '@/components/ui/Synthesis/SynthesisFlow.tsx';
import AnimateFade from '@/components/wrap/AnimateFade';
import { SynthesisState } from '@/pages/OssPage/SynthesisContext.tsx';
import SynthesisToolbar from '@/pages/OssPage/SynthesisToolbar.tsx';

function EditorOssGraph() {
  // TODO: Implement OSS editing UI here

  return (
    <AnimateFade>
      <ReactFlowProvider>
        <SynthesisState synthesisSchemaID='1'>
          <SynthesisToolbar />
          <SynthesisFlow />
        </SynthesisState>
      </ReactFlowProvider>
    </AnimateFade>
  );
}

export default EditorOssGraph;
