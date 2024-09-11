'use client';

import { RefObject, useCallback, useLayoutEffect, useMemo } from 'react';

import GraphUI, {
  CollapseProps,
  GraphCanvasRef,
  GraphEdge,
  GraphLayout,
  GraphMouseEvent,
  GraphNode,
  GraphPointerEvent,
  useSelection
} from '@/components/ui/GraphUI';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
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
  setHoverLeft: (value: boolean) => void;
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
  setHoverLeft,
  onEdit,
  onSelectCentral,
  onSelect,
  onDeselect
}: TermGraphProps) {
  const { mainHeight, darkMode } = useConceptOptions();

  const { selections, setSelections } = useSelection({
    ref: graphRef,
    nodes: nodes,
    edges: edges,
    type: 'multi',
    focusOnSelect: false
  });

  const handleHoverIn = useCallback(
    (node: GraphNode, event: GraphPointerEvent) => {
      setHoverID(Number(node.id));
      setHoverLeft(
        event.clientX / window.innerWidth >= PARAMETER.graphHoverXLimit ||
          event.clientY / window.innerHeight >= PARAMETER.graphHoverYLimit
      );
    },
    [setHoverID, setHoverLeft]
  );

  const handleHoverOut = useCallback(() => {
    setHoverID(undefined);
  }, [setHoverID]);

  const handleNodeClick = useCallback(
    (node: GraphNode, _?: CollapseProps, event?: GraphMouseEvent) => {
      if (event?.ctrlKey || event?.metaKey) {
        onSelectCentral(Number(node.id));
      } else if (selections.includes(node.id)) {
        onDeselect(Number(node.id));
      } else {
        onSelect(Number(node.id));
      }
    },
    [onSelect, selections, onDeselect, onSelectCentral]
  );

  const handleNodeDoubleClick = useCallback(
    (node: GraphNode) => {
      onEdit(Number(node.id));
    },
    [onEdit]
  );

  useLayoutEffect(() => {
    graphRef.current?.fitNodesInView([], { animated: true });
  }, [toggleResetView, graphRef]);

  useLayoutEffect(() => {
    const newSelections = nodes.filter(node => selectedIDs.includes(Number(node.id))).map(node => node.id);
    setSelections(newSelections);
  }, [selectedIDs, setSelections, nodes]);

  const canvasWidth = useMemo(() => {
    return 'calc(100vw - 1rem)';
  }, []);

  return (
    <div className='relative outline-none' style={{ width: canvasWidth, height: mainHeight }}>
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
  );
}

export default TermGraph;
