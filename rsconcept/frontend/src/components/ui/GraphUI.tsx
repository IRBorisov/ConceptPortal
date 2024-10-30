// Reexporting necessary reagraph types.
'use client';

import { GraphCanvas as GraphUI } from 'reagraph';

export {
  type CollapseProps,
  type GraphCanvasRef,
  type GraphEdge,
  type GraphNode,
  Sphere,
  useSelection
} from 'reagraph';
export { type LayoutTypes as GraphLayout } from 'reagraph';

import { ThreeEvent } from '@react-three/fiber';

export type GraphMouseEvent = ThreeEvent<MouseEvent>;
export type GraphPointerEvent = ThreeEvent<PointerEvent>;

export default GraphUI;
