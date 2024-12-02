import { ReactFlowProvider } from 'reactflow';

import { ConstituentaID } from '@/models/rsform';

import TGFlow from './TGFlow';

interface EditorTermGraphProps {
  onOpenEdit: (cstID: ConstituentaID) => void;
}

function EditorTermGraph({ onOpenEdit }: EditorTermGraphProps) {
  return (
    <ReactFlowProvider>
      <TGFlow onOpenEdit={onOpenEdit} />
    </ReactFlowProvider>
  );
}

export default EditorTermGraph;
