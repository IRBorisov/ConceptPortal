import { useCallback } from 'react';
import { type Node, useReactFlow } from '@xyflow/react';

function isNodeInView(node: Node, viewport: { x: number; y: number; zoom: number }) {
  const { x, y, zoom } = viewport;

  // Viewport in ReactFlow coordinates
  const viewLeft = -x / zoom;
  const viewTop = -y / zoom;
  const viewRight = viewLeft + window.innerWidth / zoom;
  const viewBottom = viewTop + window.innerHeight / zoom;

  const abs = node.position;

  const nodeLeft = abs.x;
  const nodeTop = abs.y;
  const nodeRight = nodeLeft + (node.measured?.width ?? 0);
  const nodeBottom = nodeTop + (node.measured?.height ?? 0);

  // Check if bounding boxes intersect
  return !(nodeRight < viewLeft || nodeLeft > viewRight || nodeBottom < viewTop || nodeTop > viewBottom);
}

export function useScrollToNode() {
  const { getNode, getViewport, fitView } = useReactFlow();

  const scrollToNode = useCallback(
    (nodeId: string, opts?: { duration?: number; padding?: number; maxZoom?: number; minZoom?: number }) => {
      const node = getNode(nodeId);
      if (!node) {
        return;
      }

      const viewport = getViewport();

      if (!isNodeInView(node, viewport)) {
        void fitView({
          nodes: [node],
          duration: opts?.duration ?? 500,
          padding: opts?.padding ?? 0.2,
          maxZoom: opts?.maxZoom,
          minZoom: opts?.minZoom
        });
      }
    },
    [getNode, getViewport, fitView]
  );

  return scrollToNode;
}
