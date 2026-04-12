import { type RO } from '@/utils/meta';
import { type AstNodeBase } from '@/utils/parsing';

import { TokenID } from './parser/token';
import { type ExpressionType, TypeClass, TypeID } from './semantic/typification';
import { RSErrorCode } from './error';

const INTEGER_TYPE_NAME = 'Z';
const ANY_TYPE_NAME = 'R0';
const LOGIC_TYPE_NAME = 'Logic';

const labelTokenRecord: Partial<Record<TokenID, string>> = {
  [TokenID.DECART]: '×',
  [TokenID.PUNCTUATION_PL]: '( )',
  [TokenID.PUNCTUATION_SL]: '[ ]',
  [TokenID.QUANTOR_UNIVERSAL]: '∀',
  [TokenID.QUANTOR_EXISTS]: '∃',
  [TokenID.LOGIC_NOT]: '¬',
  [TokenID.LOGIC_AND]: '&',
  [TokenID.LOGIC_OR]: '∨',
  [TokenID.LOGIC_IMPLICATION]: '⇒',
  [TokenID.LOGIC_EQUIVALENT]: '⇔',
  [TokenID.LIT_EMPTYSET]: '∅',
  [TokenID.LIT_WHOLE_NUMBERS]: 'Z',
  [TokenID.MULTIPLY]: '*',
  [TokenID.EQUAL]: '=',
  [TokenID.NOTEQUAL]: '≠',
  [TokenID.GREATER_OR_EQ]: '≥',
  [TokenID.LESSER_OR_EQ]: '≤',
  [TokenID.SET_IN]: '∈',
  [TokenID.SET_NOT_IN]: '∉',
  [TokenID.SUBSET_OR_EQ]: '⊆',
  [TokenID.SUBSET]: '⊂',
  [TokenID.NOT_SUBSET]: '⊄',
  [TokenID.SET_INTERSECTION]: '∩',
  [TokenID.SET_UNION]: '∪',
  [TokenID.SET_MINUS]: '\\',
  [TokenID.SET_SYMMETRIC_MINUS]: '∆',
  [TokenID.BOOLEAN]: 'ℬ()',
  [TokenID.NT_DECLARATIVE_EXPR]: 'D{}',
  [TokenID.NT_IMPERATIVE_EXPR]: 'I{}',
  [TokenID.NT_RECURSIVE_FULL]: 'R{}',
  [TokenID.BIGPR]: 'Pr1()',
  [TokenID.SMALLPR]: 'pr1()',
  [TokenID.FILTER]: 'Fi1[]()',
  [TokenID.REDUCE]: 'red()',
  [TokenID.CARD]: 'card()',
  [TokenID.BOOL]: 'bool()',
  [TokenID.DEBOOL]: 'debool()',
  [TokenID.ASSIGN]: ':=',
  [TokenID.ITERATE]: ':∈'
};

/** Retrieves label for {@link TokenID}. */
export function labelToken(id: TokenID): string {
  return labelTokenRecord[id] ?? `no label: ${id}`;
}

/** Generates label for {@link AstNodeBase}. */
export function labelRSLangNode(node: RO<AstNodeBase>): string {
  // prettier-ignore
  switch (node.typeID) {
    case TokenID.ERROR: return '[ERROR]';
    case TokenID.ID_LOCAL:
    case TokenID.ID_GLOBAL:
    case TokenID.ID_FUNCTION:
    case TokenID.ID_PREDICATE:
    case TokenID.ID_RADICAL:
      return node.data.value as string;

    case TokenID.LIT_INTEGER: return String(node.data.value as number);

    case TokenID.BIGPR: return 'Pr' + (node.data.value as string[]).toString();
    case TokenID.SMALLPR: return 'pr' + (node.data.value as string[]).toString();
    case TokenID.FILTER: return 'Fi' + (node.data.value as string[]).toString();

    case TokenID.NT_DECLARATIVE_EXPR: return 'DECLARATIVE';
    case TokenID.NT_IMPERATIVE_EXPR: return 'IMPERATIVE';
    case TokenID.NT_RECURSIVE_FULL: return 'RECURSIVE';
    case TokenID.NT_RECURSIVE_SHORT: return 'RECURSIVE';

    case TokenID.BOOLEAN: return 'ℬ';
    case TokenID.REDUCE: return 'red';
    case TokenID.CARD: return 'card';
    case TokenID.BOOL: return 'bool';
    case TokenID.DEBOOL: return 'debool';

    case TokenID.PLUS: return '+';
    case TokenID.MINUS: return '-';
    case TokenID.MULTIPLY: return '*';
    case TokenID.GREATER: return '>';
    case TokenID.LESSER: return '<';

    case TokenID.NT_TUPLE: return 'TUPLE';
    case TokenID.NT_ENUMERATION: return 'ENUM';

    case TokenID.NT_ENUM_DECL: return 'ENUM_DECLARE';
    case TokenID.NT_TUPLE_DECL: return 'TUPLE_DECLARE';
    case TokenID.PUNCTUATION_DEFINE: return 'DEFINITION';
    case TokenID.PUNCTUATION_STRUCT: return 'STRUCTURE_DEFINE';

    case TokenID.NT_ARG_DECL: return 'ARG';
    case TokenID.NT_FUNC_CALL: return 'CALL';
    case TokenID.NT_ARGUMENTS: return 'ARGS';

    case TokenID.NT_FUNC_DEFINITION: return 'FUNCTION_DEFINE';

    case TokenID.DECART:
    case TokenID.QUANTOR_UNIVERSAL:
    case TokenID.QUANTOR_EXISTS:
    case TokenID.LOGIC_NOT:
    case TokenID.LOGIC_AND:
    case TokenID.LOGIC_OR:
    case TokenID.LOGIC_IMPLICATION:
    case TokenID.LOGIC_EQUIVALENT:
    case TokenID.LIT_EMPTYSET:
    case TokenID.LIT_WHOLE_NUMBERS:
    case TokenID.EQUAL:
    case TokenID.NOTEQUAL:
    case TokenID.GREATER_OR_EQ:
    case TokenID.LESSER_OR_EQ:
    case TokenID.SET_IN:
    case TokenID.SET_NOT_IN:
    case TokenID.SUBSET_OR_EQ:
    case TokenID.SUBSET:
    case TokenID.NOT_SUBSET:
    case TokenID.SET_INTERSECTION:
    case TokenID.SET_UNION:
    case TokenID.SET_MINUS:
    case TokenID.SET_SYMMETRIC_MINUS:
    case TokenID.ASSIGN:
    case TokenID.ITERATE:
      return labelToken(node.typeID);
  }
  if (node.data.value) {
    return node.data.value as string;
  }
  return 'UNKNOWN ' + String(node.typeID);
}

/** Generates error description for {@link RSErrorCode}. */
export function describeRSError(code: RSErrorCode, params: readonly string[] = []): string {
  // prettier-ignore
  switch (code) {
    case RSErrorCode.syntax:
      return 'Неопределенная синтаксическая ошибка';
    case RSErrorCode.missingParenthesis:
      return "Пропущена ')'";
    case RSErrorCode.missingCurlyBrace:
      return "Пропущена '}'";
    case RSErrorCode.expectedLocal:
      return 'Ожидалось имя переменной';
    case RSErrorCode.expectedType:
      return `Ожидался тип: ${params[0]}`;

    case RSErrorCode.localDoubleDeclare:
      return `Повторное объявление: ${params[0]}`;
    case RSErrorCode.localNotUsed:
      return `Неиспользованная переменная: ${params[0]}`;
    case RSErrorCode.localUndeclared:
      return `Необъявленная переменная: ${params[0]}`;
    case RSErrorCode.localShadowing:
      return `Повторное объявление переменной: ${params[0]}`;

    case RSErrorCode.typesNotEqual:
      return `Типизации не совпадают: ${params[0]} ≠ ${params[1]}`;
    case RSErrorCode.globalNotTyped:
      return `Нет типизации: ${params[0]}`;
    case RSErrorCode.invalidDecart:
      return `τ(α×b) = 𝔅(𝔇τ(α)×𝔇τ(b)). Некорректный аргумент: ${params[0]}`;
    case RSErrorCode.invalidBoolean:
      return `τ(ℬ(a)) = 𝔅𝔅𝔇τ(a). Некорректный аргумент: ${params[0]}`;
    case RSErrorCode.invalidTypeOperation:
      return `Аргумент операции должен быть множеством: ${params[0]}`;
    case RSErrorCode.invalidCard:
      return `Мощность только для множеств: ${params[0]}`;
    case RSErrorCode.invalidDebool:
      return `τ(debool(a)) = 𝔇τ(a). Некорректный аргумент: ${params[0]}`;
    case RSErrorCode.globalFuncWithoutArgs:
      return `Функция без аргументов: ${params[0]}`;
    case RSErrorCode.invalidReduce:
      return `τ(red(a)) = 𝔅𝔇𝔇τ(a). Некорректный аргумент: ${params[0]}`;
    case RSErrorCode.invalidProjectionTuple:
      return `Проекция только для кортежа: ${params[0]} -> ${params[1] ?? 'не определено'}`;
    case RSErrorCode.invalidProjectionSet:
      return `τ(Pri(a)) = 𝔅𝒞i𝔇τ(a). Некорректный аргумент: ${params[0]} -> ${params[1] ?? 'не определено'}`;
    case RSErrorCode.invalidEnumeration:
      return `Типизация элементов не совпадает: ${params[0]} ≠ ${params[1]}`;
    case RSErrorCode.invalidCortegeDeclare:
      return `Количество переменных в кортеже не соответствует размерности декартова произведения`;
    case RSErrorCode.localOutOfScope:
      return `Использование переменной вне области видимости: ${params[0]}`;
    case RSErrorCode.invalidElementPredicate:
      return `Несоответствие типизаций: ${params[0]}${params[1]}${params[2]}`;
    case RSErrorCode.invalidEmptySetUsage:
      return 'Бессмысленное использование пустого множества';
    case RSErrorCode.invalidArgsArity:
      return `Неверное число аргументов: ${params[0]} ≠ ${params[1]}`;
    case RSErrorCode.invalidArgumentType:
      return `Типизация аргумента не соответствует объявленной: ${params[0]} != ${params[1]}`;
    case RSErrorCode.globalStructure:
      return `Область определения родовой структуры не корректна`;
    case RSErrorCode.radicalUsage:
      return `Радикалы запрещены вне деклараций: ${params[0]}`;
    case RSErrorCode.invalidFilterArgumentType:
      return `Типизация аргумента фильтра не корректна: ${params[0]}(${params[1]})`;
    case RSErrorCode.invalidFilterArity:
      return `Количество параметров фильтра не соответствует количеству индексов`;
    case RSErrorCode.arithmeticNotSupported:
      return `Тип не поддерживает арифметику: ${params[0]}`;
    case RSErrorCode.typesNotCompatible:
      return `Типы не совместимы для выбранной операции: ${params[0]} и ${params[1]}`;
    case RSErrorCode.orderingNotSupported:
      return `Тип не поддерживает предикаты порядка: ${params[0]}`;
    case RSErrorCode.globalNoValue:
      return `Невычислимый идентификатор: ${params[0]}`;
    case RSErrorCode.invalidPropertyUsage:
      return `Неитерируемое множество в качестве значения`;

    case RSErrorCode.cstEmptyDerived:
      return 'Пустое выражение для сложного понятия или утверждения';

    case RSErrorCode.calcUnknownError:
      return 'Неизвестная ошибка вычисления';
    case RSErrorCode.calculationNotSupported:
      return 'Объявление функции не предполагает вычисления';
    case RSErrorCode.setOverflow:
      return `Превышен лимит количества элементов: ${params[0]}`;
    case RSErrorCode.booleanBaseLimit:
      return `Превышен лимит для основания булеана: ${params[0]}`;
    case RSErrorCode.calcGlobalMissing:
      return `Нет значения: ${params[0]}`;
    case RSErrorCode.iterationsLimit:
      return `Превышен лимит итераций ${params[0]}`;
    case RSErrorCode.calcInvalidDebool:
      return 'Некорректное взятие debool';
    case RSErrorCode.iterateInfinity:
      return 'Итерация по бесконечности';
  }
  return 'UNKNOWN ERROR';
}

/** Converts expression type to string. */
export function labelType(type: RO<ExpressionType> | null): string {
  if (!type) {
    return 'N/A';
  }
  switch (type.typeID) {
    case TypeID.anyTypification:
      return ANY_TYPE_NAME;
    case TypeID.integer:
      return INTEGER_TYPE_NAME;
    case TypeID.basic:
      return type.baseID;
    case TypeID.tuple:
      return type.factors
        .map(factor => (factor.typeID === TypeID.tuple ? `(${labelType(factor)})` : labelType(factor)))
        .join('×');
    case TypeID.collection:
      return type.base.typeID === TypeID.collection ? `ℬ${labelType(type.base)}` : `ℬ(${labelType(type.base)})`;
    case TypeID.logic:
      return LOGIC_TYPE_NAME;
    case TypeID.predicate:
    case TypeID.function:
      const argsText = type.args.map(arg => labelType(arg.type)).join(', ');
      return `[${argsText}] → ${labelType(type.result)}`;
  }
}

/** Converts expression type to normalized string. */
export function normalizeType(type: RO<ExpressionType> | null): string {
  if (!type) {
    return 'N/A';
  }
  switch (type.typeID) {
    case TypeID.anyTypification:
      return ANY_TYPE_NAME;
    case TypeID.integer:
    case TypeID.basic:
      return 'X1';
    case TypeID.tuple:
      return type.factors
        .map(factor => (factor.typeID === TypeID.tuple ? `(${normalizeType(factor)})` : normalizeType(factor)))
        .join('×');
    case TypeID.collection:
      return type.base.typeID === TypeID.collection ? `ℬ${normalizeType(type.base)}` : `ℬ(${normalizeType(type.base)})`;
    case TypeID.logic:
      return LOGIC_TYPE_NAME;
    case TypeID.predicate:
    case TypeID.function:
      const argsText = type.args.map(arg => normalizeType(arg.type)).join(', ');
      return `[${argsText}] → ${normalizeType(type.result)}`;
  }
}

/** Generates label for type class. */
export function labelTypeClass(type: TypeClass): string {
  switch (type) {
    case TypeClass.logic:
      return 'Логический';
    case TypeClass.typification:
      return 'Теоретико-множественный';
    case TypeClass.function:
      return 'Терм-функция';
    case TypeClass.predicate:
      return 'Предикат-функция';
  }
}
