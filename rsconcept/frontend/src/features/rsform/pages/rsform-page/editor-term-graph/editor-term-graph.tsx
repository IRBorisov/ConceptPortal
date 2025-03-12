import { ReactFlowProvider } from 'reactflow';

import { TGFlow } from './tg-flow';

export function EditorTermGraph() {
  return (
    <ReactFlowProvider>
      <TGFlow />
    </ReactFlowProvider>
  );
}
