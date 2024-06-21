'use client';

import AnimateFade from '@/components/wrap/AnimateFade';
import SynthesisToolbar from '@/pages/OssPage/SynthesisToolbar.tsx';
import SynthesisFlow from '@/components/ui/Synthesis/SynthesisFlow.tsx';
import { SynthesisState } from '@/pages/OssPage/SynthesisContext.tsx';
import { ReactFlowProvider } from '@reactflow/core';

function EditorOssGraph() {
  // TODO: Implement OSS editing UI here

  return (
    <AnimateFade>
      <ReactFlowProvider>
        <SynthesisState synthesisSchemaID="1">
          <SynthesisToolbar />
          <SynthesisFlow />
        </SynthesisState>
      </ReactFlowProvider>
    </AnimateFade>
  );
}

export default EditorOssGraph;
