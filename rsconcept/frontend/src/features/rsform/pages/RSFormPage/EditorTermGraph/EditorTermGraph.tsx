import { ReactFlowProvider } from 'reactflow';

import { TGFlow } from './TGFlow';

export function EditorTermGraph() {
  return (
    <ReactFlowProvider>
      <TGFlow />
    </ReactFlowProvider>
  );
}
