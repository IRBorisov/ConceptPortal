import { globalTx } from '@/i18n';

import { type RO } from '@/utils/meta';
import { type AstNodeBase } from '@/utils/parsing';

import { TokenID } from './parser/token';
import { type ExpressionType, TypeClass, TypeID } from './semantic/typification';
import { RSErrorCode } from './error';

const INTEGER_TYPE_NAME = 'Z';
const ANY_TYPE_NAME = 'R0';
const LOGIC_TYPE_NAME = 'Logic';

const RSLANG_ERROR_MESSAGE_ID: Record<RSErrorCode, string> = {
  [RSErrorCode.unknownSyntax]: 'tx.rslang.error.unknownSyntax',
  [RSErrorCode.missingParenthesis]: 'tx.rslang.error.missingParenthesis',
  [RSErrorCode.missingCurlyBrace]: 'tx.rslang.error.missingCurlyBrace',
  [RSErrorCode.missingSquareBracket]: 'tx.rslang.error.missingSquareBracket',
  [RSErrorCode.bracketMismatch]: 'tx.rslang.error.bracketMismatch',
  [RSErrorCode.doubleParenthesis]: 'tx.rslang.error.doubleParenthesis',
  [RSErrorCode.missingOpenBracket]: 'tx.rslang.error.missingOpenBracket',
  [RSErrorCode.expectedLocal]: 'tx.rslang.error.expectedLocal',
  [RSErrorCode.expectedType]: 'tx.rslang.error.expectedType',
  [RSErrorCode.localDoubleDeclare]: 'tx.rslang.error.localDoubleDeclare',
  [RSErrorCode.localNotUsed]: 'tx.rslang.error.localNotUsed',
  [RSErrorCode.localUndeclared]: 'tx.rslang.error.localUndeclared',
  [RSErrorCode.localShadowing]: 'tx.rslang.error.localShadowing',
  [RSErrorCode.typesNotEqual]: 'tx.rslang.error.typesNotEqual',
  [RSErrorCode.globalNotTyped]: 'tx.rslang.error.globalNotTyped',
  [RSErrorCode.invalidDecart]: 'tx.rslang.error.invalidDecart',
  [RSErrorCode.invalidBoolean]: 'tx.rslang.error.invalidBoolean',
  [RSErrorCode.invalidTypeOperation]: 'tx.rslang.error.invalidTypeOperation',
  [RSErrorCode.invalidCard]: 'tx.rslang.error.invalidCard',
  [RSErrorCode.invalidDebool]: 'tx.rslang.error.invalidDebool',
  [RSErrorCode.globalFuncWithoutArgs]: 'tx.rslang.error.globalFuncWithoutArgs',
  [RSErrorCode.invalidReduce]: 'tx.rslang.error.invalidReduce',
  [RSErrorCode.invalidProjectionTuple]: 'tx.rslang.error.invalidProjectionTuple',
  [RSErrorCode.invalidProjectionSet]: 'tx.rslang.error.invalidProjectionSet',
  [RSErrorCode.invalidEnumeration]: 'tx.rslang.error.invalidEnumeration',
  [RSErrorCode.invalidCortegeDeclare]: 'tx.rslang.error.invalidCortegeDeclare',
  [RSErrorCode.localOutOfScope]: 'tx.rslang.error.localOutOfScope',
  [RSErrorCode.invalidElementPredicate]: 'tx.rslang.error.invalidElementPredicate',
  [RSErrorCode.invalidEmptySetUsage]: 'tx.rslang.error.invalidEmptySetUsage',
  [RSErrorCode.invalidArgsArity]: 'tx.rslang.error.invalidArgsArity',
  [RSErrorCode.invalidArgumentType]: 'tx.rslang.error.invalidArgumentType',
  [RSErrorCode.globalStructure]: 'tx.rslang.error.globalStructure',
  [RSErrorCode.radicalUsage]: 'tx.rslang.error.radicalUsage',
  [RSErrorCode.invalidFilterArgumentType]: 'tx.rslang.error.invalidFilterArgumentType',
  [RSErrorCode.invalidFilterArity]: 'tx.rslang.error.invalidFilterArity',
  [RSErrorCode.arithmeticNotSupported]: 'tx.rslang.error.arithmeticNotSupported',
  [RSErrorCode.typesNotCompatible]: 'tx.rslang.error.typesNotCompatible',
  [RSErrorCode.orderingNotSupported]: 'tx.rslang.error.orderingNotSupported',
  [RSErrorCode.globalNoValue]: 'tx.rslang.error.globalNoValue',
  [RSErrorCode.invalidPropertyUsage]: 'tx.rslang.error.invalidPropertyUsage',
  [RSErrorCode.cstEmptyDerived]: 'tx.rslang.error.cstEmptyDerived',
  [RSErrorCode.definitionNotAllowed]: 'tx.rslang.error.definitionNotAllowed',
  [RSErrorCode.calcUnknownError]: 'tx.rslang.error.calcUnknownError',
  [RSErrorCode.calculationNotSupported]: 'tx.rslang.error.calculationNotSupported',
  [RSErrorCode.setOverflow]: 'tx.rslang.error.setOverflow',
  [RSErrorCode.booleanBaseLimit]: 'tx.rslang.error.booleanBaseLimit',
  [RSErrorCode.calcGlobalMissing]: 'tx.rslang.error.calcGlobalMissing',
  [RSErrorCode.iterationsLimit]: 'tx.rslang.error.iterationsLimit',
  [RSErrorCode.calcInvalidDebool]: 'tx.rslang.error.calcInvalidDebool',
  [RSErrorCode.iterateInfinity]: 'tx.rslang.error.iterateInfinity'
};

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
  const text = labelTokenRecord[id];
  return text ?? 'UNKNOWN TOKEN: ' + String(id);
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

    case TokenID.LIT_INTEGER: return String(node.data.value);

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
  return 'UNKNOWN NODE: ' + String(node.typeID);
}

/** Generates error description for {@link RSErrorCode}. */
export function describeRSError(code: RSErrorCode, params: readonly string[] = []): string {
  const id = RSLANG_ERROR_MESSAGE_ID[code];
  if (id === undefined) {
    return 'UNKNOWN ERROR';
  }
  const notDef = () => 'NOT DEFINED';
  switch (code) {
    case RSErrorCode.bracketMismatch:
      return globalTx(id, { open: params[0] ?? '', close: params[1] ?? '' });
    case RSErrorCode.missingOpenBracket:
      return globalTx(id, { bracket: params[0] ?? '' });
    case RSErrorCode.expectedType:
      return globalTx(id, { type: params[0] ?? '' });
    case RSErrorCode.localDoubleDeclare:
    case RSErrorCode.localNotUsed:
    case RSErrorCode.localUndeclared:
    case RSErrorCode.localShadowing:
    case RSErrorCode.globalNotTyped:
    case RSErrorCode.globalFuncWithoutArgs:
    case RSErrorCode.localOutOfScope:
    case RSErrorCode.radicalUsage:
    case RSErrorCode.globalNoValue:
    case RSErrorCode.calcGlobalMissing:
      return globalTx(id, { name: params[0] ?? '' });
    case RSErrorCode.typesNotEqual:
    case RSErrorCode.invalidEnumeration:
    case RSErrorCode.invalidArgsArity:
    case RSErrorCode.typesNotCompatible:
      return globalTx(id, { a: params[0] ?? '', b: params[1] ?? '' });
    case RSErrorCode.invalidDecart:
    case RSErrorCode.invalidBoolean:
    case RSErrorCode.invalidTypeOperation:
    case RSErrorCode.invalidCard:
    case RSErrorCode.invalidDebool:
    case RSErrorCode.invalidReduce:
      return globalTx(id, { arg: params[0] ?? '' });
    case RSErrorCode.arithmeticNotSupported:
    case RSErrorCode.orderingNotSupported:
      return globalTx(id, { type: params[0] ?? '' });
    case RSErrorCode.invalidProjectionTuple:
    case RSErrorCode.invalidProjectionSet:
      return globalTx(id, {
        from: params[0] ?? '',
        to: params[1] !== undefined && params[1] !== '' ? params[1] : notDef()
      });
    case RSErrorCode.invalidElementPredicate:
      return globalTx(id, { a: params[0] ?? '', b: params[1] ?? '', c: params[2] ?? '' });
    case RSErrorCode.invalidArgumentType:
      return globalTx(id, { expected: params[0] ?? '', actual: params[1] ?? '' });
    case RSErrorCode.invalidFilterArgumentType:
      return globalTx(id, { a: params[0] ?? '', b: params[1] ?? '' });
    case RSErrorCode.setOverflow:
    case RSErrorCode.booleanBaseLimit:
    case RSErrorCode.iterationsLimit:
      return globalTx(id, { limit: params[0] ?? '' });
    default:
      return globalTx(id);
  }
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
      return globalTx('tx.rslang.typeClass.logic');
    case TypeClass.typification:
      return globalTx('tx.rslang.typeClass.typification');
    case TypeClass.function:
      return globalTx('tx.rslang.typeClass.function');
    case TypeClass.predicate:
      return globalTx('tx.rslang.typeClass.predicate');
  }
}
