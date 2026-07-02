'use client';

import { type ReactNode, useState } from 'react';
import {
  Background,
  type Edge,
  type Node,
  type OnNodeDrag,
  ReactFlow,
  type ReactFlowProps
} from '@xyflow/react';

import { useTooltipsStore } from '@/stores/tooltips';
import { withPreventDefault } from '@/utils/utils';

import { cn } from '../utils';

type DiagramFlowProps<NodeType extends Node = Node, EdgeType extends Edge = Edge> = Omit<
  ReactFlowProps<NodeType, EdgeType>,
  'height'
> & {
  children?: ReactNode;

  /** Canvas height (number in px or CSS length). */
  height?: number | string;

  /** Renders a dot grid background. */
  showGrid?: boolean;

  /** Dot grid spacing in pixels when {@link showGrid} is enabled. */
  gridSize?: number;

  /** Keyboard handler on the focusable wrapper (runs before internal Space-pan logic). */
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;

  /** Keyboard handler on the focusable wrapper (runs after internal Space-pan logic). */
  onKeyUp?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
};

/**
 * React Flow wrapper with Space-to-pan mode, tooltip suppression while dragging, and optional grid.
 *
 * @remarks
 * Extends {@link ReactFlowProps}; all standard React Flow callbacks and options are supported.
 */
export function DiagramFlow<NodeType extends Node = Node, EdgeType extends Edge = Edge>({
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
}: DiagramFlowProps<NodeType, EdgeType>) {
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

  const handleNodeDragStart: OnNodeDrag<NodeType> = (event, node, nodes) => {
    hideTooltips();
    onNodeDragStart?.(event, node, nodes);
  };

  const handleNodeDragStop: OnNodeDrag<NodeType> = (event, node, nodes) => {
    showTooltips();
    onNodeDragStop?.(event, node, nodes);
  };

  return (
    <div
      tabIndex={-1}
      className={cn('relative cc-mask-sides h-full max-w-480 w-dvw', spaceMode && 'mode-space', className)}
      style={{ ...style, height: height }}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      <ReactFlow
        {...restProps}
        elementsSelectable={!spaceMode}
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
