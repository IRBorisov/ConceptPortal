import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';

import { InteractionMode, useTermGraphStore } from '../../../stores/term-graph';
import { useRSFormEdit } from '../rsedit-context';

import { TGFlow } from './tg-flow';

export function EditorTermGraph() {
  const setMode = useTermGraphStore(state => state.setMode);
  const { isContentEditable } = useRSFormEdit();

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
