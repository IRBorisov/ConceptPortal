'use client';

import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';

import GraphUI, { GraphCanvasRef, GraphEdge, GraphNode, LayoutTypes, useSelection } from '@/components/ui/GraphUI';
import { useConceptOptions } from '@/context/OptionsContext';
import { ConstituentaID } from '@/models/rsform';
import { graphDarkT, graphLightT } from '@/styling/color';
import { PARAMETER, resources } from '@/utils/constants';

interface TermGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedIDs: ConstituentaID[];

  layout: LayoutTypes;
  is3D: boolean;
  orbit: boolean;

  setHoverID: (newID: ConstituentaID | undefined) => void;
  onEdit: (cstID: ConstituentaID) => void;
  onSelect: (newID: ConstituentaID) => void;
  onDeselect: (newID: ConstituentaID) => void;

  toggleResetView: boolean;
}

function TermGraph({
  nodes,
  edges,
  selectedIDs,
  layout,
  is3D,
  orbit,
  toggleResetView,
  setHoverID,
  onEdit,
  onSelect,
  onDeselect
}: TermGraphProps) {
  const { calculateHeight, darkMode } = useConceptOptions();
  const graphRef = useRef<GraphCanvasRef | null>(null);

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
      if (selections.includes(node.id)) {
        onDeselect(Number(node.id));
      } else {
        onSelect(Number(node.id));
      }
    },
    [onSelect, selections, onDeselect]
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
  }, [toggleResetView]);

  useLayoutEffect(() => {
    const newSelections = nodes.filter(node => selectedIDs.includes(Number(node.id))).map(node => node.id);
    setSelections(newSelections);
  }, [selectedIDs, setSelections, nodes]);

  const canvasWidth = useMemo(() => {
    return 'calc(100vw - 1rem)';
  }, []);

  const canvasHeight = useMemo(() => calculateHeight('1.75rem + 4px'), [calculateHeight]);

  return (
    <div className='outline-none'>
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
