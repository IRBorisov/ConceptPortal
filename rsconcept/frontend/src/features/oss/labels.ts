import { type RO } from '@/utils/meta';

import { OperationType } from './backend/types';
import {
  type IOperation,
  type IOssItem,
  type ISubstitutionErrorDescription,
  SubstitutionErrorType
} from './models/oss';
import { isOperation } from './models/oss-api';

/** Retrieves label for {@link OperationType}. */
export function labelOperationType(itemType: OperationType): string {
  // prettier-ignore
  switch (itemType) {
    case OperationType.INPUT:     return 'Загрузка';
    case OperationType.SYNTHESIS: return 'Синтез';
  }
}

/** Retrieves description for {@link OperationType}. */
export function describeOperationType(itemType: OperationType): string {
  // prettier-ignore
  switch (itemType) {
    case OperationType.INPUT:     return 'Загрузка концептуальной схемы в ОСС';
    case OperationType.SYNTHESIS: return 'Синтез концептуальных схем';
  }
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
  if (isOperation(item)) {
    return `${(item as IOperation).alias}: ${item.title}`;
  } else {
    return `Блок: ${item.title}`;
  }
}
