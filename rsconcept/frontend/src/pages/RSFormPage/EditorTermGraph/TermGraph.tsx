'use client';

import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';

import GraphUI, { GraphCanvasRef, GraphEdge, GraphNode, LayoutTypes, useSelection } from '@/components/ui/GraphUI';
import { useConceptTheme } from '@/context/ThemeContext';
import { ConstituentaID } from '@/models/rsform';
import { graphDarkT, graphLightT } from '@/styling/color';
import { resources } from '@/utils/constants';

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
  onDeselectAll: () => void;

  toggleResetView: boolean;
}

const TREE_SIZE_MILESTONE = 50;

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
  onDeselectAll
}: TermGraphProps) {
  const { calculateHeight, darkMode } = useConceptTheme();
  const graphRef = useRef<GraphCanvasRef | null>(null);

  const { selections, actives, setSelections, onCanvasClick, onNodePointerOver, onNodePointerOut } = useSelection({
    ref: graphRef,
    nodes,
    edges,
    type: 'multi', // 'single' | 'multi' | 'multiModifier'
    pathSelectionType: 'out',
    pathHoverType: 'all',
    focusOnSelect: false
  });

  const handleHoverIn = useCallback(
    (node: GraphNode) => {
      setHoverID(Number(node.id));
      if (onNodePointerOver) onNodePointerOver(node);
    },
    [onNodePointerOver, setHoverID]
  );

  const handleHoverOut = useCallback(
    (node: GraphNode) => {
      setHoverID(undefined);
      if (onNodePointerOut) onNodePointerOut(node);
    },
    [onNodePointerOut, setHoverID]
  );

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      if (selections.includes(node.id)) {
        onEdit(Number(node.id));
      } else {
        onSelect(Number(node.id));
      }
    },
    [onSelect, selections, onEdit]
  );

  const handleCanvasClick = useCallback(
    (event: MouseEvent) => {
      onDeselectAll();
      if (onCanvasClick) onCanvasClick(event);
    },
    [onCanvasClick, onDeselectAll]
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
          draggable
          ref={graphRef}
          nodes={nodes}
          edges={edges}
          layoutType={layout}
          selections={selections}
          actives={actives}
          onNodeClick={handleNodeClick}
          onCanvasClick={handleCanvasClick}
          onNodePointerOver={handleHoverIn}
          onNodePointerOut={handleHoverOut}
          cameraMode={orbit ? 'orbit' : is3D ? 'rotate' : 'pan'}
          layoutOverrides={
            layout.includes('tree') ? { nodeLevelRatio: nodes.length < TREE_SIZE_MILESTONE ? 3 : 1 } : undefined
          }
          labelFontUrl={resources.graph_font}
          theme={darkMode ? graphDarkT : graphLightT}
        />
      </div>
    </div>
  );
}

export default TermGraph;
