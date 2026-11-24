import { describe, expect, it } from 'vitest';

import { OperationType } from '@rsconcept/domain/library';

import { createMinimalOssDTO } from '@/backend/test/sync-fixtures';

import { OssLoader } from './oss-loader';
import { collectRelativizations } from './relativization-passport';
import { schemaOperation, schemaOperationSchema } from './types';

const operationDefaults = {
  oss: 3,
  alias: '',
  title: '',
  description: '',
  parent: null,
  is_import: false,
  has_additions: false
};

describe('OSS relativization passport', () => {
  it('counts operations and distinct attached results, excluding replicas', () => {
    const parameters = {
      source: { id: 100, alias: 'РО', title: 'Родственные отношения' },
      target: { alias: 'S4', term: 'Брачное отношение' },
      excluded: [{ alias: 'X1', term: 'индивиды' }]
    };

    const operations = [
      { id: 1, operation_type: OperationType.INPUT, result: 100 },
      { id: 2, operation_type: OperationType.RELATIVIZATION, result: 200, relativization: parameters },
      { id: 3, operation_type: OperationType.REPLICA, result: 200 },
      { id: 4, operation_type: OperationType.RELATIVIZATION, result: null }
    ].map(operation => schemaOperation.parse({ ...operationDefaults, ...operation }));
    const input = schemaOperationSchema.parse(
      createMinimalOssDTO({
        operations,
        arguments: [{ argument: 1, operation: 2 }],
        replicas: [{ original: 2, replica: 3 }]
      })
    );

    const oss = new OssLoader(input).produceOSS();

    expect(oss.stats).toMatchObject({ count_relativization: 2, count_relativized_schemas: 1 });
    expect(collectRelativizations(oss.operations)).toMatchObject([
      { id: 2, result: 200, relativization: parameters },
      { id: 4, result: null, relativization: null }
    ]);
  });

  it('returns zero counts for schemas created before relativization was introduced', () => {
    const oss = new OssLoader(createMinimalOssDTO()).produceOSS();

    expect(oss.stats).toMatchObject({ count_relativization: 0, count_relativized_schemas: 0 });
    expect(collectRelativizations(oss.operations)).toEqual([]);
  });
});
