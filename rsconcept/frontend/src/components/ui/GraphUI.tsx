// Reexporting reagraph types to wrap in 'use client'.
'use client';

import { GraphCanvas as GraphUI } from 'reagraph';

export { type GraphEdge, type GraphNode, type GraphCanvasRef, Sphere, useSelection } from 'reagraph';
export { type LayoutTypes as GraphLayout } from 'reagraph';

export default GraphUI;
