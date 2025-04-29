'use client';

import { type ReactNode, useState } from 'react';
import { Background, ReactFlow, type ReactFlowProps } from 'reactflow';

export { useReactFlow, useStoreApi } from 'reactflow';

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

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.code === 'Space') {
      event.preventDefault();
      event.stopPropagation();
      setSpaceMode(true);
    }
    onKeyDown?.(event);
  }

  function handleKeyUp(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.code === 'Space') {
      setSpaceMode(false);
    }
    onKeyUp?.(event);
  }

  function handleContextMenu(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    onContextMenu?.(event);
  }

  return (
    <div
      tabIndex={-1}
      className={cn('relative cc-mask-sides w-[100dvw]', spaceMode && 'space-mode', className)}
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
        onNodeDragStart={spaceMode ? undefined : onNodeDragStart}
        onNodeDrag={spaceMode ? undefined : onNodeDrag}
        onNodeDragStop={spaceMode ? undefined : onNodeDragStop}
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
