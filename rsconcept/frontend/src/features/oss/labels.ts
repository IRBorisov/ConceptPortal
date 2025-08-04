import { type RO } from '@/utils/meta';

import { OperationType } from './backend/types';
import {
  type IOperation,
  type IOssItem,
  type ISubstitutionErrorDescription,
  NodeType,
  SubstitutionErrorType
} from './models/oss';

const labelOperationTypeRecord: Record<OperationType, string> = {
  [OperationType.INPUT]: 'Загрузка',
  [OperationType.SYNTHESIS]: 'Синтез',
  [OperationType.REFERENCE]: 'Ссылка'
};

const describeOperationTypeRecord: Record<OperationType, string> = {
  [OperationType.INPUT]: 'Загрузка концептуальной схемы в ОСС',
  [OperationType.SYNTHESIS]: 'Синтез концептуальных схем',
  [OperationType.REFERENCE]: 'Создание ссылки на результат операции'
};

/** Retrieves label for {@link OperationType}. */
export function labelOperationType(itemType: OperationType): string {
  return labelOperationTypeRecord[itemType] ?? `UNKNOWN OPERATION TYPE: ${itemType}`;
}

/** Retrieves description for {@link OperationType}. */
export function describeOperationType(itemType: OperationType): string {
  return describeOperationTypeRecord[itemType] ?? `UNKNOWN OPERATION TYPE: ${itemType}`;
}

/** Generates error description for {@link ISubstitutionErrorDescription}. */
export function describeSubstitutionError(error: RO<ISubstitutionErrorDescription>): string {
  switch (error.errorType) {
    case SubstitutionErrorType.invalidIDs:
      return 'Ошибка в идентификаторах схем';
    case SubstitutionErrorType.incorrectCst:
      return `Ошибка ${error.params[0]} -> ${error.params[1]}: некорректное выражение конституенты`;
    case SubstitutionErrorType.invalidBasic:
      return `Ошибка ${error.params[0]} -> ${error.params[1]}: замена структурного понятия базисным множеством`;
    case SubstitutionErrorType.invalidConstant:
      return `Ошибка ${error.params[0]} -> ${error.params[1]}: подстановка константного множества возможна только вместо другого константного`;
    case SubstitutionErrorType.invalidClasses:
      return `Ошибка ${error.params[0]} -> ${error.params[1]}: классы конституент не совпадают`;
    case SubstitutionErrorType.typificationCycle:
      return `Ошибка: цикл подстановок в типизациях ${error.params[0]}`;
    case SubstitutionErrorType.baseSubstitutionNotSet:
      return `Ошибка: типизация не задает множество ${error.params[0]} ∈ ${error.params[1]}`;
    case SubstitutionErrorType.unequalTypification:
      return `Ошибка ${error.params[0]} -> ${error.params[1]}: типизация структурных операндов не совпадает`;
    case SubstitutionErrorType.unequalArgsCount:
      return `Ошибка ${error.params[0]} -> ${error.params[1]}: количество аргументов не совпадает`;
    case SubstitutionErrorType.unequalArgs:
      return `Ошибка ${error.params[0]} -> ${error.params[1]}: типизация аргументов не совпадает`;
    case SubstitutionErrorType.unequalExpressions:
      return `Предупреждение ${error.params[0]} -> ${error.params[1]}: определения понятий не совпадают`;
  }
  return 'UNKNOWN ERROR';
}

/** Retrieves label for {@link IOssItem}. */
export function labelOssItem(item: RO<IOssItem>): string {
  if (item.nodeType === NodeType.OPERATION) {
    return `${(item as IOperation).alias}: ${item.title}`;
  } else {
    return `Блок: ${item.title}`;
  }
}
