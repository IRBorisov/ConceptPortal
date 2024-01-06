'use client';

import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';

import GraphUI, { GraphCanvasRef, GraphEdge, GraphNode, LayoutTypes, Sphere, useSelection } from '@/components/GraphUI';
import { useConceptTheme } from '@/context/ThemeContext';
import { graphDarkT, graphLightT } from '@/styling/color';
import { resources } from '@/utils/constants';

interface TermGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];

  layout: LayoutTypes;
  is3D: boolean;
  orbit: boolean;

  setSelected: (selected: number[]) => void;
  setHoverID: (newID: number | undefined) => void;
  onEdit: (cstID: number) => void;
  onDeselect: () => void;

  toggleResetView: boolean;
  toggleResetSelection: boolean;
}

const TREE_SIZE_MILESTONE = 50;

function TermGraph({
  nodes,
  edges,
  layout,
  is3D,
  orbit,
  toggleResetView,
  toggleResetSelection,
  setHoverID,
  onEdit,
  setSelected,
  onDeselect
}: TermGraphProps) {
  const { noNavigation, darkMode } = useConceptTheme();
  const graphRef = useRef<GraphCanvasRef | null>(null);

  const { selections, actives, onNodeClick, clearSelections, onCanvasClick, onNodePointerOver, onNodePointerOut } =
    useSelection({
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
        return;
      }
      if (onNodeClick) onNodeClick(node);
    },
    [onNodeClick, selections, onEdit]
  );

  const handleCanvasClick = useCallback(
    (event: MouseEvent) => {
      onDeselect();
      if (onCanvasClick) onCanvasClick(event);
    },
    [onCanvasClick, onDeselect]
  );

  useLayoutEffect(() => {
    graphRef.current?.resetControls(true);
    graphRef.current?.centerGraph();
  }, [toggleResetView]);

  useLayoutEffect(() => {
    clearSelections();
  }, [toggleResetSelection, clearSelections]);

  useLayoutEffect(() => {
    setSelected(selections.map(id => Number(id)));
  }, [selections, setSelected]);

  const canvasWidth = useMemo(() => {
    return 'calc(100vw - 1.1rem)';
  }, []);

  const canvasHeight = useMemo(() => {
    return !noNavigation ? 'calc(100vh - 9.8rem - 4px)' : 'calc(100vh - 3rem - 4px)';
  }, [noNavigation]);

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
          renderNode={({ node, ...rest }) => <Sphere {...rest} node={node} />}
        />
      </div>
    </div>
  );
}

export default TermGraph;
