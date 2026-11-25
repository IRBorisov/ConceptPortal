import { describe, expect, it } from 'vitest';

import { OperationType, type OssLayout } from '@rsconcept/domain/library';

import { createMinimalOssDTO } from '@/backend/test/sync-fixtures';

import { OssLoader } from '../../backend/oss-loader';
import { schemaOperation } from '../../backend/types';

import { getRelativizationPlacement } from './placement';

const timeUpdate = '2026-10-01T00:00:00Z';
const fallback = { x: 0, y: 0 };

function makeOss(layout: OssLayout) {
  const operations = [1, 2].map(id =>
    schemaOperation.parse({
      id,
      oss: 3,
      alias: '',
      title: '',
      description: '',
      parent: null,
      result: 100 + id,
      is_import: false,
      has_additions: false,
      operation_type: id === 1 ? OperationType.INPUT : OperationType.RELATIVIZATION
    })
  );
  return new OssLoader(
    createMinimalOssDTO({
      time_update: timeUpdate,
      operations,
      blocks: [{ id: 1, oss: 3, title: 'Root block', description: '', parent: null }],
      layout
    })
  ).produceOSS();
}

describe('relativization graph placement', () => {
  it('clears sibling blocks after moving away from another operation', () => {
    const oss = makeOss([
      { nodeID: 'o1', x: 0, y: 0, width: 150, height: 40 },
      { nodeID: 'o2', x: 0, y: 100, width: 150, height: 40 },
      { nodeID: 'b1', x: 170, y: 160, width: 210, height: 160 }
    ]);
    const result = getRelativizationPlacement(oss, fallback, null, 1);
    const { x, y, width, height } = result.position;
    const block = oss.layout[2]!;

    expect(result.expectedTimeUpdate).toBe(timeUpdate);
    expect(
      x + width <= block.x || x >= block.x + block.width || y + height <= block.y || y >= block.y + block.height
    ).toBe(true);
  });

  it('uses the saved position for edits and starts inside the block when reparenting', () => {
    const saved = { x: 0, y: 100, width: 180, height: 50 };
    const oss = makeOss([
      { nodeID: 'o1', x: 0, y: 0, width: 150, height: 40 },
      { nodeID: 'o2', ...saved },
      { nodeID: 'b1', x: 420, y: 160, width: 50, height: 50 }
    ]);

    expect(getRelativizationPlacement(oss, fallback, null, 1, 2)).toMatchObject({
      position: saved,
      expectedTimeUpdate: timeUpdate
    });
    const moved = getRelativizationPlacement(oss, fallback, 1, 1, 2);
    expect(moved.position).toEqual({ x: 440, y: 180, width: 180, height: 50 });
    expect(moved.layout).toContainEqual({ nodeID: 'b1', x: 420, y: 160, width: 220, height: 90 });
    expect(moved.layout.some(node => node.nodeID === 'o2')).toBe(false);
    expect(oss.layout[2]!.width).toBe(50);
  });
});
