import { ReactFlowProvider } from 'reactflow';

import TGFlow from './TGFlow';

function EditorTermGraph() {
  return (
    <ReactFlowProvider>
      <TGFlow />
    </ReactFlowProvider>
  );
}

export default EditorTermGraph;
