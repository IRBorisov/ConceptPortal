'use client';

import { RefObject, useCallback, useLayoutEffect, useMemo } from 'react';

import GraphUI, { GraphCanvasRef, GraphEdge, GraphLayout, GraphNode, useSelection } from '@/components/ui/GraphUI';
import { useConceptOptions } from '@/context/OptionsContext';
import { ConstituentaID } from '@/models/rsform';
import { graphDarkT, graphLightT } from '@/styling/color';
import { PARAMETER, resources } from '@/utils/constants';

interface TermGraphProps {
  graphRef: RefObject<GraphCanvasRef>;
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedIDs: ConstituentaID[];

  layout: GraphLayout;
  is3D: boolean;
  orbit: boolean;

  setHoverID: (newID: ConstituentaID | undefined) => void;
  onEdit: (cstID: ConstituentaID) => void;
  onSelectCentral: (selectedID: ConstituentaID) => void;
  onSelect: (newID: ConstituentaID) => void;
  onDeselect: (newID: ConstituentaID) => void;

  toggleResetView: boolean;
}

function TermGraph({
  graphRef,
  nodes,
  edges,
  selectedIDs,
  layout,
  is3D,
  orbit,
  toggleResetView,
  setHoverID,
  onEdit,
  onSelectCentral,
  onSelect,
  onDeselect
}: TermGraphProps) {
  let ctrlKey: boolean = false;
  const { calculateHeight, darkMode } = useConceptOptions();

  const { selections, setSelections } = useSelection({
    ref: graphRef,
    nodes: nodes,
    edges: edges,
    type: 'multi',
    focusOnSelect: false
  });

  const handleHoverIn = useCallback(
    (node: GraphNode) => {
      setHoverID(Number(node.id));
    },
    [setHoverID]
  );

  const handleHoverOut = useCallback(() => {
    setHoverID(undefined);
  }, [setHoverID]);

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      if (ctrlKey) {
        onSelectCentral(Number(node.id));
      } else if (selections.includes(node.id)) {
        onDeselect(Number(node.id));
      } else {
        onSelect(Number(node.id));
      }
    },
    [onSelect, selections, onDeselect, onSelectCentral, ctrlKey]
  );

  const handleNodeDoubleClick = useCallback(
    (node: GraphNode) => {
      onEdit(Number(node.id));
    },
    [onEdit]
  );

  useLayoutEffect(() => {
    graphRef.current?.resetControls(true);
    graphRef.current?.centerGraph();
  }, [toggleResetView, graphRef]);

  useLayoutEffect(() => {
    const newSelections = nodes.filter(node => selectedIDs.includes(Number(node.id))).map(node => node.id);
    setSelections(newSelections);
  }, [selectedIDs, setSelections, nodes]);

  const canvasWidth = useMemo(() => {
    return 'calc(100vw - 1rem)';
  }, []);

  const canvasHeight = useMemo(() => calculateHeight('1.75rem + 4px'), [calculateHeight]);

  return (
    <div
      className='outline-none'
      tabIndex={-1}
      // TODO: fix hacky way of tracking CTRL. Expose event from onNodeClick instead
      onKeyUp={event => (ctrlKey = event.ctrlKey)}
      onKeyDown={event => (ctrlKey = event.ctrlKey)}
    >
      <div className='relative' style={{ width: canvasWidth, height: canvasHeight }}>
        <GraphUI
          nodes={nodes}
          edges={edges}
          ref={graphRef}
          animated={false}
          draggable
          layoutType={layout}
          selections={selections}
          onNodeDoubleClick={handleNodeDoubleClick}
          onNodeClick={handleNodeClick}
          onNodePointerOver={handleHoverIn}
          onNodePointerOut={handleHoverOut}
          minNodeSize={4}
          maxNodeSize={8}
          cameraMode={orbit ? 'orbit' : is3D ? 'rotate' : 'pan'}
          layoutOverrides={
            layout.includes('tree') ? { nodeLevelRatio: nodes.length < PARAMETER.smallTreeNodes ? 3 : 1 } : undefined
          }
          labelFontUrl={resources.graph_font}
          theme={darkMode ? graphDarkT : graphLightT}
        />
      </div>
    </div>
  );
}

export default TermGraph;
