import { type OperationSchema, type Position2D } from '@rsconcept/domain/library';
import { LayoutManager, OPERATION_NODE_HEIGHT, OPERATION_NODE_WIDTH } from '@rsconcept/domain/library/oss-layout-api';

export function getRelativizationPlacement(
  oss: OperationSchema,
  fallback: Position2D,
  parentID: number | null,
  sourceID: number,
  existingID?: number
) {
  const existing = existingID === undefined ? undefined : oss.operationByID.get(existingID);
  const previous = oss.layout.find(node => node.nodeID === existing?.nodeID);
  const expectedTimeUpdate = oss.time_update;
  if (existing?.parent === parentID && previous) {
    const { x, y, width, height } = previous;
    return { layout: oss.layout, position: { x, y, width, height }, expectedTimeUpdate };
  }

  const layout = oss.layout.filter(node => node.nodeID !== existing?.nodeID).map(node => ({ ...node }));
  const manager = new LayoutManager(oss, layout);
  const position = manager.newOperationPosition(
    {
      ...fallback,
      width: previous?.width ?? OPERATION_NODE_WIDTH,
      height: previous?.height ?? OPERATION_NODE_HEIGHT
    },
    parentID,
    existing && parentID !== null ? [] : [sourceID]
  );
  return { layout, position, expectedTimeUpdate };
}
