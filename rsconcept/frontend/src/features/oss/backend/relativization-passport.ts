import { type Operation, type OperationSchemaStats, OperationType } from '@rsconcept/domain/library';

export function collectRelativizations(operations: readonly Operation[]) {
  return operations.filter(operation => operation.operation_type === OperationType.RELATIVIZATION);
}

export function calculateRelativizationStats(
  operations: readonly Operation[]
): Pick<OperationSchemaStats, 'count_relativization' | 'count_relativized_schemas'> {
  let countRelativization = 0;
  const results = new Set<number>();
  for (const operation of operations) {
    if (operation.operation_type === OperationType.RELATIVIZATION) {
      ++countRelativization;
      if (operation.result !== null) {
        results.add(operation.result);
      }
    }
  }
  return { count_relativization: countRelativization, count_relativized_schemas: results.size };
}
