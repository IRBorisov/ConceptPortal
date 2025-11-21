'use client';

import { type ReactNode, useState } from 'react';
import { Background, type Node, ReactFlow, type ReactFlowProps } from 'reactflow';

export { useReactFlow, useStoreApi } from 'reactflow';

import { useTooltipsStore } from '@/stores/tooltips';
import { withPreventDefault } from '@/utils/utils';

import { cn } from '../utils';

type DiagramFlowProps = {
  children?: ReactNode;
  height?: number | string;
  showGrid?: boolean;
  gridSize?: number;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  onKeyUp?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
} & ReactFlowProps;

export function DiagramFlow({
  children,
  className,
  style,
  height,
  showGrid = false,
  gridSize = 20,
  onKeyDown,
  onKeyUp,

  nodesDraggable = true,
  nodesFocusable,
  edgesFocusable,

  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onNodeDoubleClick,
  onNodeContextMenu,
  onNodeMouseEnter,
  onNodeMouseLeave,

  onNodeDragStart,
  onNodeDrag,
  onNodeDragStop,
  onContextMenu,
  ...restProps
}: DiagramFlowProps) {
  const [spaceMode, setSpaceMode] = useState(false);
  const showTooltips = useTooltipsStore(state => state.showTooltips);
  const hideTooltips = useTooltipsStore(state => state.hideTooltips);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.code === 'Space') {
      if (!spaceMode) {
        hideTooltips();
        withPreventDefault(() => setSpaceMode(true))(event);
      }
    }
    onKeyDown?.(event);
  }

  function handleKeyUp(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.code === 'Space') {
      showTooltips();
      setSpaceMode(false);
    }
    onKeyUp?.(event);
  }

  function handleContextMenu(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    onContextMenu?.(event);
  }

  function handleNodeDragStart(event: React.MouseEvent<Element>, node: Node, nodes: Node[]) {
    hideTooltips();
    onNodeDragStart?.(event, node, nodes);
  }

  function handleNodeDragStop(event: React.MouseEvent<Element>, node: Node, nodes: Node[]) {
    showTooltips();
    onNodeDragStop?.(event, node, nodes);
  }

  return (
    <div
      tabIndex={-1}
      className={cn('relative cc-mask-sides max-w-480 w-dvw', spaceMode && 'mode-space', className)}
      style={{ ...style, height: height }}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      <ReactFlow
        {...restProps}
        onNodesChange={spaceMode ? undefined : onNodesChange}
        onEdgesChange={spaceMode ? undefined : onEdgesChange}
        onNodeClick={spaceMode ? undefined : onNodeClick}
        onNodeDoubleClick={spaceMode ? undefined : onNodeDoubleClick}
        nodesDraggable={!spaceMode && nodesDraggable}
        nodesFocusable={!spaceMode && nodesFocusable}
        edgesFocusable={!spaceMode && edgesFocusable}
        onNodeDragStart={spaceMode ? undefined : handleNodeDragStart}
        onNodeDrag={spaceMode ? undefined : onNodeDrag}
        onNodeDragStop={spaceMode ? undefined : handleNodeDragStop}
        onNodeContextMenu={spaceMode ? undefined : onNodeContextMenu}
        onNodeMouseEnter={spaceMode ? undefined : onNodeMouseEnter}
        onNodeMouseLeave={spaceMode ? undefined : onNodeMouseLeave}
        onContextMenu={handleContextMenu}
      >
        {showGrid ? <Background gap={gridSize} /> : null}
        {children}
      </ReactFlow>
    </div>
  );
}
