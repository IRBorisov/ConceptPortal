// Reexporting reagraph types to wrap in 'use client'.
'use client';

import { GraphCanvas as GraphUI } from 'reagraph';

export {
  type GraphEdge,
  type GraphNode,
  type GraphCanvasRef,
  Sphere,
  useSelection,
  type CollapseProps
} from 'reagraph';
export { type LayoutTypes as GraphLayout } from 'reagraph';

import { ThreeEvent } from '@react-three/fiber';

export type GraphMouseEvent = ThreeEvent<MouseEvent>;
export type GraphPointerEvent = ThreeEvent<PointerEvent>;

export default GraphUI;
