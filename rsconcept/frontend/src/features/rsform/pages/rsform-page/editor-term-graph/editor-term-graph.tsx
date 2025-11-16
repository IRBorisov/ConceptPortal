import { useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';

import { InteractionMode, useTermGraphStore } from '../../../stores/term-graph';
import { useRSEdit } from '../rsedit-context';

import { TGFlow } from './tg-flow';

export function EditorTermGraph() {
  const setMode = useTermGraphStore(state => state.setMode);
  const { isContentEditable } = useRSEdit();

  useEffect(() => {
    if (!isContentEditable) {
      setMode(InteractionMode.explore);
    }
  }, [isContentEditable, setMode]);

  return (
    <ReactFlowProvider>
      <TGFlow />
    </ReactFlowProvider>
  );
}
