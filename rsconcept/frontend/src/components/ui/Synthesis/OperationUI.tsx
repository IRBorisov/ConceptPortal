// Reexporting reaOperation types to wrap in 'use client'.
'use client';

import { GraphCanvas as OperationUI } from 'reagraph';

export {
  type GraphEdge,
  type GraphNode,
  type GraphCanvasRef,
  Sphere,
  useSelection,
  type CollapseProps
} from 'reagraph';
export { type LayoutTypes as OperationLayout } from 'reagraph';

import { ThreeEvent } from '@react-three/fiber';

export type OperationMouseEvent = ThreeEvent<MouseEvent>;
export type OperationPointerEvent = ThreeEvent<PointerEvent>;

export default OperationUI;
