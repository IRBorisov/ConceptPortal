import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';

import { InteractionMode, useTermGraphStore } from '../../../stores/term-graph';
import { useSchemaEdit } from '../schema-edit-context';

import { TGFlow } from './tg-flow';

export function TabSchemaGraph() {
  const setMode = useTermGraphStore(state => state.setMode);
  const { isContentEditable } = useSchemaEdit();

  useEffect(
    function adjustAccessMode() {
      if (!isContentEditable) {
        setMode(InteractionMode.explore);
      }
    },
    [isContentEditable, setMode]
  );

  return (
    <ReactFlowProvider>
      <TGFlow />
    </ReactFlowProvider>
  );
}
