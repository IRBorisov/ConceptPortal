/**
 * Generates description for {@link IConstituenta}.
 */

import { PARAMETER } from '@/utils/constants';
import { prepareTooltip } from '@/utils/utils';

import { type IVersionInfo } from '../library';
import { type CurrentVersion } from '../library/models/library';

import { CstType, type IRSErrorDescription, ParsingStatus, RSErrorType, TokenID } from './backend/types';
import { type GramData, Grammeme, ReferenceType } from './models/language';
import { CstClass, ExpressionStatus, type IConstituenta } from './models/rsform';
import { type IArgumentInfo, type ISyntaxTreeNode } from './models/rslang';
import { CstMatchMode, DependencyMode } from './stores/cstSearch';
import { type GraphColoring } from './stores/termGraph';

/**
 * Generates description for {@link IConstituenta}.
 */
export function describeConstituenta(cst: IConstituenta): string {
  if (cst.cst_type === CstType.STRUCTURED) {
    return (
      cst.term_resolved ||
      cst.term_raw ||
      cst.definition_resolved ||
      cst.definition_raw ||
      cst.convention ||
      cst.definition_formal
    );
  } else {
    return (
      cst.term_resolved ||
      cst.term_raw ||
      cst.definition_resolved ||
      cst.definition_raw ||
      cst.definition_formal ||
      cst.convention
    );
  }
}

/**
 * Generates description for term of a given {@link IConstituenta}.
 */
export function describeConstituentaTerm(cst: IConstituenta | null): string {
  if (!cst) {
    return '!Конституента отсутствует!';
  }
  if (!cst.term_resolved) {
    return '!Пустой термин!';
  } else {
    return cst.term_resolved;
  }
}

/**
 * Generates label for {@link IConstituenta}.
 */
export function labelConstituenta(cst: IConstituenta) {
  return `${cst.alias}: ${describeConstituenta(cst)}`;
}

/**
 * Generates label for {@link IVersionInfo} of {@link IRSForm}.
 */
export function labelVersion(value: CurrentVersion, items: IVersionInfo[]) {
  const version = items.find(ver => ver.id === value);
  return version ? version.version : 'актуальная';
}

/**
 * Retrieves label for {@link TokenID}.
 */
export function labelToken(id: TokenID): string {
  // prettier-ignore
  switch (id) {
    case TokenID.BOOLEAN: return 'ℬ()';
    case TokenID.DECART: return '×';
    case TokenID.PUNCTUATION_PL: return '( )';
    case TokenID.PUNCTUATION_SL: return '[ ]';
    case TokenID.QUANTOR_UNIVERSAL: return '∀';
    case TokenID.QUANTOR_EXISTS: return '∃';
    case TokenID.LOGIC_NOT: return '¬';
    case TokenID.LOGIC_AND: return '&';
    case TokenID.LOGIC_OR: return '∨';
    case TokenID.LOGIC_IMPLICATION: return '⇒';
    case TokenID.LOGIC_EQUIVALENT: return '⇔';
    case TokenID.LIT_EMPTYSET: return '∅';
    case TokenID.LIT_WHOLE_NUMBERS: return 'Z';
    case TokenID.MULTIPLY: return '*';
    case TokenID.EQUAL: return '=';
    case TokenID.NOTEQUAL: return '≠';
    case TokenID.GREATER_OR_EQ: return '≥';
    case TokenID.LESSER_OR_EQ: return '≤';
    case TokenID.SET_IN: return '∈';
    case TokenID.SET_NOT_IN: return '∉';
    case TokenID.SUBSET_OR_EQ: return '⊆';
    case TokenID.SUBSET: return '⊂';
    case TokenID.NOT_SUBSET: return '⊄';
    case TokenID.SET_INTERSECTION: return '∩';
    case TokenID.SET_UNION: return '∪';
    case TokenID.SET_MINUS: return '\\';
    case TokenID.SET_SYMMETRIC_MINUS: return '∆';
    case TokenID.NT_DECLARATIVE_EXPR: return 'D{}';
    case TokenID.NT_IMPERATIVE_EXPR: return 'I{}';
    case TokenID.NT_RECURSIVE_FULL: return 'R{}';
    case TokenID.BIGPR: return 'Pr1()';
    case TokenID.SMALLPR: return 'pr1()';
    case TokenID.FILTER: return 'Fi1[]()';
    case TokenID.REDUCE: return 'red()';
    case TokenID.CARD: return 'card()';
    case TokenID.BOOL: return 'bool()';
    case TokenID.DEBOOL: return 'debool()';
    case TokenID.ASSIGN: return ':=';
    case TokenID.ITERATE: return ':∈';
  }
  return `no label: ${id}`;
}

/**
 * Return shortcut description for {@link CstType}.
 */
export function getCstTypeShortcut(type: CstType) {
  const prefix = labelCstType(type) + ' [Alt + ';
  // prettier-ignore
  switch (type) {
    case CstType.BASE: return prefix + '1]';
    case CstType.STRUCTURED: return prefix + '2]';
    case CstType.TERM: return prefix + '3]';
    case CstType.AXIOM: return prefix + '4]';
    case CstType.FUNCTION: return prefix + 'Q]';
    case CstType.PREDICATE: return prefix + 'W]';
    case CstType.CONSTANT: return prefix + '5]';
    case CstType.THEOREM: return prefix + '6]';
  }
}

/**
 * Generates description for {@link TokenID}.
 */
export function describeToken(id: TokenID): string {
  // prettier-ignore
  switch (id) {
    case TokenID.BOOLEAN: return prepareTooltip('Булеан', 'Alt + E / Shift + B');
    case TokenID.DECART: return prepareTooltip('Декартово произведение', 'Alt + Shift + E / Shift + 8');
    case TokenID.PUNCTUATION_PL: return prepareTooltip('Скобки () вокруг выражения', 'Alt + Shift + 9');
    case TokenID.PUNCTUATION_SL: return prepareTooltip('Скобки [] вокруг выражения', 'Alt + [');
    case TokenID.QUANTOR_UNIVERSAL: return prepareTooltip('Квантор всеобщности', '`');
    case TokenID.QUANTOR_EXISTS: return prepareTooltip('Квантор существования', 'Shift + `');
    case TokenID.LOGIC_NOT: return prepareTooltip('Отрицание', 'Alt + `');
    case TokenID.LOGIC_AND: return prepareTooltip('Конъюнкция', 'Alt + 3 ~ Shift + 7');
    case TokenID.LOGIC_OR: return prepareTooltip('Дизъюнкция', 'Alt + Shift + 3');
    case TokenID.LOGIC_IMPLICATION: return prepareTooltip('Импликация', 'Alt + 4');
    case TokenID.LOGIC_EQUIVALENT: return prepareTooltip('Эквивалентность', 'Alt + Shift + 4');
    case TokenID.LIT_EMPTYSET: return prepareTooltip('Пустое множество', 'Alt + X');
    case TokenID.LIT_WHOLE_NUMBERS: return prepareTooltip('Целые числа', 'Alt + Z');
    case TokenID.EQUAL: return prepareTooltip('Равенство');
    case TokenID.MULTIPLY: return prepareTooltip('Умножение чисел', 'Alt + 8');
    case TokenID.NOTEQUAL: return prepareTooltip('Неравенство', 'Alt + Shift + `');
    case TokenID.GREATER_OR_EQ: return prepareTooltip('Больше или равно', 'Alt + Shift + 7');
    case TokenID.LESSER_OR_EQ: return prepareTooltip('Меньше или равно', 'Alt + Shift + 8');
    case TokenID.SET_IN: return prepareTooltip('Быть элементом (принадлежит)', 'Alt + 1');
    case TokenID.SET_NOT_IN: return prepareTooltip('Не принадлежит', 'Alt + Shift + 1');
    case TokenID.SUBSET_OR_EQ: return prepareTooltip('Быть частью (нестрогое подмножество)', 'Alt + 2');
    case TokenID.SUBSET: return prepareTooltip('Строгое подмножество', 'Alt + 7');
    case TokenID.NOT_SUBSET: return prepareTooltip('Не подмножество', 'Alt + Shift + 2');
    case TokenID.SET_INTERSECTION: return prepareTooltip('Пересечение', 'Alt + A');
    case TokenID.SET_UNION: return prepareTooltip('Объединение', 'Alt + S');
    case TokenID.SET_MINUS: return prepareTooltip('Разность множеств', 'Alt + 5');
    case TokenID.SET_SYMMETRIC_MINUS: return prepareTooltip('Симметрическая разность', 'Alt + Shift + 5');
    case TokenID.NT_DECLARATIVE_EXPR: return prepareTooltip('Декларативное определение', 'Alt + D');
    case TokenID.NT_IMPERATIVE_EXPR: return prepareTooltip('Императивное определение', 'Alt + G');
    case TokenID.NT_RECURSIVE_FULL: return prepareTooltip('Рекурсивное определение (цикл)', 'Alt + T');
    case TokenID.BIGPR: return prepareTooltip('Большая проекция', 'Alt + Q');
    case TokenID.SMALLPR: return prepareTooltip('Малая проекция', 'Alt + W');
    case TokenID.FILTER: return prepareTooltip('Фильтр', 'Alt + F');
    case TokenID.REDUCE: return prepareTooltip('Множество-сумма', 'Alt + R');
    case TokenID.CARD: return prepareTooltip('Мощность', 'Alt + C');
    case TokenID.BOOL: return prepareTooltip('Синглетон', 'Alt + B');
    case TokenID.DEBOOL: return prepareTooltip('Десинглетон', 'Alt + V');
    case TokenID.ASSIGN: return prepareTooltip('Присвоение', 'Alt + Shift + 6');
    case TokenID.ITERATE: return prepareTooltip('Перебор элементов множества', 'Alt + 6');
  }
  return `no description: ${id}`;
}

/**
 * Retrieves label for {@link CstMatchMode}.
 */
export function labelCstMatchMode(mode: CstMatchMode): string {
  // prettier-ignore
  switch (mode) {
    case CstMatchMode.ALL: return 'общий';
    case CstMatchMode.EXPR: return 'выражение';
    case CstMatchMode.TERM: return 'термин';
    case CstMatchMode.TEXT: return 'текст';
    case CstMatchMode.NAME: return 'имя';
  }
}

/**
 * Retrieves description for {@link CstMatchMode}.
 */
export function describeCstMatchMode(mode: CstMatchMode): string {
  // prettier-ignore
  switch (mode) {
    case CstMatchMode.ALL: return 'все атрибуты';
    case CstMatchMode.EXPR: return 'формальное определение';
    case CstMatchMode.TERM: return 'термин';
    case CstMatchMode.TEXT: return 'определение и конвенция';
    case CstMatchMode.NAME: return 'только имена';
  }
}

/**
 * Retrieves label for {@link DependencyMode}.
 */
export function labelCstSource(mode: DependencyMode): string {
  // prettier-ignore
  switch (mode) {
    case DependencyMode.ALL: return 'не ограничен';
    case DependencyMode.OUTPUTS: return 'потребители';
    case DependencyMode.INPUTS: return 'поставщики';
    case DependencyMode.EXPAND_OUTPUTS: return 'зависимые';
    case DependencyMode.EXPAND_INPUTS: return 'влияющие';
  }
}

/**
 * Retrieves description for {@link DependencyMode}.
 */
export function describeCstSource(mode: DependencyMode): string {
  // prettier-ignore
  switch (mode) {
    case DependencyMode.ALL: return 'все конституенты';
    case DependencyMode.OUTPUTS: return 'прямые исходящие';
    case DependencyMode.INPUTS: return 'прямые входящие';
    case DependencyMode.EXPAND_OUTPUTS: return 'цепочка исходящих';
    case DependencyMode.EXPAND_INPUTS: return 'цепочка входящих';
  }
}

/**
 * Retrieves label for {@link GraphColoring}.
 */
export const mapLabelColoring = new Map<GraphColoring, string>([
  ['none', 'Цвет: Моно'],
  ['status', 'Цвет: Статус'],
  ['type', 'Цвет: Класс'],
  ['schemas', 'Цвет: Схемы']
]);

/**
 * Retrieves label for {@link ExpressionStatus}.
 */
export function labelExpressionStatus(status: ExpressionStatus): string {
  // prettier-ignore
  switch (status) {
    case ExpressionStatus.VERIFIED: return 'корректно';
    case ExpressionStatus.INCORRECT: return 'ошибка';
    case ExpressionStatus.INCALCULABLE: return 'невычислимо';
    case ExpressionStatus.PROPERTY: return 'неразмерное';
    case ExpressionStatus.UNKNOWN: return 'не проверено';
    case ExpressionStatus.UNDEFINED: return 'N/A';
  }
}

/**
 * Retrieves description for {@link ExpressionStatus}.
 */
export function describeExpressionStatus(status: ExpressionStatus): string {
  // prettier-ignore
  switch (status) {
    case ExpressionStatus.VERIFIED: return 'выражение корректно и вычислимо';
    case ExpressionStatus.INCORRECT: return 'ошибка в выражении';
    case ExpressionStatus.INCALCULABLE: return 'интерпретация не вычисляется';
    case ExpressionStatus.PROPERTY: return 'только проверка принадлежности';
    case ExpressionStatus.UNKNOWN: return 'требует проверки выражения';
    case ExpressionStatus.UNDEFINED: return 'произошла ошибка при проверке';
  }
}

/**
 * Retrieves label for {@link CstType}.
 */
export function labelCstType(target: CstType): string {
  // prettier-ignore
  switch (target) {
    case CstType.BASE: return 'Базисное множество';
    case CstType.CONSTANT: return 'Константное множество';
    case CstType.STRUCTURED: return 'Родовая структура';
    case CstType.AXIOM: return 'Аксиома';
    case CstType.TERM: return 'Терм';
    case CstType.FUNCTION: return 'Терм-функция';
    case CstType.PREDICATE: return 'Предикат-функция';
    case CstType.THEOREM: return 'Теорема';
  }
}

/**
 * Retrieves label for {@link ReferenceType}.
 */
export function labelReferenceType(target: ReferenceType): string {
  // prettier-ignore
  switch (target) {
    case ReferenceType.ENTITY: return 'Использование термина';
    case ReferenceType.SYNTACTIC: return 'Связывание слов';
  }
}

/**
 * Retrieves label for {@link CstClass}.
 */
export function labelCstClass(target: CstClass): string {
  // prettier-ignore
  switch (target) {
    case CstClass.BASIC: return 'базовый';
    case CstClass.DERIVED: return 'производный';
    case CstClass.STATEMENT: return 'утверждение';
    case CstClass.TEMPLATE: return 'шаблон';
  }
}

/**
 * Retrieves description for {@link CstClass}.
 */
export function describeCstClass(target: CstClass): string {
  // prettier-ignore
  switch (target) {
    case CstClass.BASIC: return 'неопределяемое понятие';
    case CstClass.DERIVED: return 'определяемое понятие';
    case CstClass.STATEMENT: return 'логическое утверждение';
    case CstClass.TEMPLATE: return 'шаблон определения';
  }
}

/**
 * Generates label for typification.
 */
export function labelTypification({
  isValid,
  resultType,
  args
}: {
  isValid: boolean;
  resultType: string;
  args: IArgumentInfo[];
}): string {
  if (!isValid) {
    return 'N/A';
  }
  if (resultType === '' || resultType === PARAMETER.logicLabel) {
    resultType = 'Logical';
  }
  if (args.length === 0) {
    return resultType;
  }
  const argsText = args.map(arg => arg.typification).join(', ');
  return `${resultType} 🠔 [${argsText}]`;
}

/**
 * Generates label for {@link IConstituenta} typification.
 */
export function labelCstTypification(cst: IConstituenta): string {
  return labelTypification({
    isValid: cst.parse.status === ParsingStatus.VERIFIED,
    resultType: cst.parse.typification,
    args: cst.parse.args
  });
}

/**
 * Generates label for {@link ISyntaxTreeNode}.
 */
export function labelSyntaxTree(node: ISyntaxTreeNode): string {
  // prettier-ignore
  switch (node.typeID) {
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

    case TokenID.NT_RECURSIVE_SHORT: return labelToken(TokenID.NT_RECURSIVE_FULL);

    case TokenID.BOOLEAN:
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
    case TokenID.NT_DECLARATIVE_EXPR:
    case TokenID.NT_IMPERATIVE_EXPR:
    case TokenID.NT_RECURSIVE_FULL:
    case TokenID.REDUCE:
    case TokenID.CARD:
    case TokenID.BOOL:
    case TokenID.DEBOOL:
    case TokenID.ASSIGN:
    case TokenID.ITERATE:
      return labelToken(node.typeID);
  }
  // node
  if (node.data.value) {
    return node.data.value as string;
  }
  return 'UNKNOWN ' + String(node.typeID);
}

/**
 * Generates label for grammeme.
 */
export function labelGrammeme(gram: GramData): string {
  // prettier-ignore
  switch (gram as Grammeme) {
    default: return `Неизв: ${gram}`;

    case Grammeme.NOUN: return 'ЧР: сущ';
    case Grammeme.VERB: return 'ЧР: глагол';
    case Grammeme.INFN: return 'ЧР: глагол инф';
    case Grammeme.ADJF: return 'ЧР: прил';
    case Grammeme.PRTF: return 'ЧР: прич';
    case Grammeme.ADJS: return 'ЧР: кр прил';
    case Grammeme.PRTS: return 'ЧР: кр прич';
    case Grammeme.COMP: return 'ЧР: компаратив';
    case Grammeme.GRND: return 'ЧР: деепричастие';
    case Grammeme.NUMR: return 'ЧР: число';
    case Grammeme.ADVB: return 'ЧР: наречие';
    case Grammeme.NPRO: return 'ЧР: местоимение';
    case Grammeme.PRED: return 'ЧР: предикатив';
    case Grammeme.PREP: return 'ЧР: предлог';
    case Grammeme.CONJ: return 'ЧР: союз';
    case Grammeme.PRCL: return 'ЧР: частица';
    case Grammeme.INTJ: return 'ЧР: междометие';
    case Grammeme.Abbr: return 'ЧР: аббревиатура';

    case Grammeme.sing: return 'Число: един';
    case Grammeme.plur: return 'Число: множ';

    case Grammeme.nomn: return 'Падеж: имен';
    case Grammeme.gent: return 'Падеж: род';
    case Grammeme.datv: return 'Падеж: дат';
    case Grammeme.accs: return 'Падеж: вин';
    case Grammeme.ablt: return 'Падеж: твор';
    case Grammeme.loct: return 'Падеж: пред';

    case Grammeme.masc: return 'Род: муж';
    case Grammeme.femn: return 'Род: жен';
    case Grammeme.neut: return 'Род: ср';

    case Grammeme.perf: return 'Совершенный: да';
    case Grammeme.impf: return 'Совершенный: нет';

    case Grammeme.tran: return 'Переходный: да';
    case Grammeme.intr: return 'Переходный: нет';

    case Grammeme.pres: return 'Время: настоящее';
    case Grammeme.past: return 'Время: прошедшее';
    case Grammeme.futr: return 'Время: будущее';

    case Grammeme.per1: return 'Лицо: 1';
    case Grammeme.per2: return 'Лицо: 2';
    case Grammeme.per3: return 'Лицо: 3';

    case Grammeme.impr: return 'Повелительный: да';
    case Grammeme.indc: return 'Повелительный: нет';

    case Grammeme.incl: return 'Включающий: да';
    case Grammeme.excl: return 'Включающий: нет';

    case Grammeme.pssv: return 'Страдательный: да';
    case Grammeme.actv: return 'Страдательный: нет';

    case Grammeme.anim: return 'Одушевленный: да';
    case Grammeme.inan: return 'Одушевленный: нет';

    case Grammeme.Infr: return 'Стиль: неформальный';
    case Grammeme.Slng: return 'Стиль: жаргон';
    case Grammeme.Arch: return 'Стиль: устаревший';
    case Grammeme.Litr: return 'Стиль: литературный';
  }
}

/**
 * Generates error description for {@link IRSErrorDescription}.
 */
export function describeRSError(error: IRSErrorDescription): string {
  // prettier-ignore
  switch (error.errorType) {
    case RSErrorType.unknownSymbol:
      return `Неизвестный символ: ${error.params[0]}`;
    case RSErrorType.syntax:
      return 'Неопределенная синтаксическая ошибка';
    case RSErrorType.missingParenthesis:
      return 'Некорректная конструкция языка родов структур, проверьте структуру выражения';
    case RSErrorType.missingCurlyBrace:
      return "Пропущен символ '}'";
    case RSErrorType.invalidQuantifier:
      return 'Некорректная кванторная декларация';
    case RSErrorType.invalidImperative:
      return 'Использование императивного синтаксиса вне императивного блока';
    case RSErrorType.expectedArgDeclaration:
      return 'Ожидалось объявление аргументов терм-функции';
    case RSErrorType.expectedLocal:
      return 'Ожидалось имя локальной переменной';

    case RSErrorType.localDoubleDeclare:
      return `Предупреждение! Повторное объявление локальной переменной ${error.params[0]}`;
    case RSErrorType.localNotUsed:
      return `Предупреждение! Переменная объявлена, но не использована: ${error.params[0]}`;
    case RSErrorType.localUndeclared:
      return `Использование необъявленной переменной: ${error.params[0]}`;
    case RSErrorType.localShadowing:
      return `Повторное объявление переменной: ${error.params[0]}`;

    case RSErrorType.typesNotEqual:
      return `Типизация операндов не совпадает! ${error.params[0]} != ${error.params[1]}`;
    case RSErrorType.globalNotTyped:
      return `Типизация конституенты не определена: ${error.params[0]}`;
    case RSErrorType.invalidDecart:
      return `τ(α×b) = B(Dτ(α)×Dτ(b)). Некорректная типизация аргумента: ${error.params[0]}`;
    case RSErrorType.invalidBoolean:
      return `τ(B(a)) = BBDτ(a). Некорректная типизация аргумента: ${error.params[0]}`;
    case RSErrorType.invalidTypeOperation:
      return `Типизация операнда теоретико-множественной операции не корректна: ${error.params[0]}`;
    case RSErrorType.invalidCard:
      return `Некорректная типизация аргумента операции мощности: ${error.params[0]}`;
    case RSErrorType.invalidDebool:
      return `τ(debool(a)) = Dτ(a). Некорректная типизация аргумента: ${error.params[0]}`;
    case RSErrorType.globalFuncMissing:
      return `Неизвестное имя функции: ${error.params[0]}`;
    case RSErrorType.globalFuncWithoutArgs:
      return `Некорректное использование имени функции без аргументов: ${error.params[0]}`;
    case RSErrorType.invalidReduce:
      return `τ(red(a)) = BDDτ(a). Некорректная типизация аргумента: ${error.params[0]}`;
    case RSErrorType.invalidProjectionTuple:
      return `Проекция не определена: ${error.params[0]} -> ${error.params[1]}`;
    case RSErrorType.invalidProjectionSet:
      return `τ(Pri(a)) = BCiDτ(a). Некорректная типизация аргумента: ${error.params[0]} -> ${error.params[1]}`;
    case RSErrorType.invalidEnumeration:
      return `Типизация элементов перечисления не совпадает: ${error.params[0]} != ${error.params[1]}`;
    case RSErrorType.invalidBinding:
      return `Количество переменных в кортеже не соответствует размерности декартова произведения`;
    case RSErrorType.localOutOfScope:
      return `Использование имени переменной вне области действия: ${error.params[0]}`;
    case RSErrorType.invalidElementPredicate:
      return `Несоответствие типизаций операндов для оператора: ${error.params[0]}${error.params[1]}${error.params[2]}`;
    case RSErrorType.invalidEmptySetUsage:
      return 'Бессмысленное использование пустого множества';
    case RSErrorType.invalidArgsArity:
      return `Неверное число аргументов терм-функции: ${error.params[0]} != ${error.params[1]}`;
    case RSErrorType.invalidArgumentType:
      return `Типизация аргумента терм-функции не соответствует объявленной: ${error.params[0]} != ${error.params[1]}`;
    case RSErrorType.globalStructure:
      return `Область определения родовой структуры не корректна`;
    case RSErrorType.radicalUsage:
      return `Радикалы запрещены вне деклараций терм-функции: ${error.params[0]}`;
    case RSErrorType.invalidFilterArgumentType:
      return `Типизация аргумента фильтра не корректна: ${error.params[0]}(${error.params[1]})`;
    case RSErrorType.invalidFilterArity:
      return `Количество параметров фильтра не соответствует количеству индексов`;
    case RSErrorType.arithmeticNotSupported:
      return `Тип не поддерживает арифметические операторы: ${error.params[0]}`;
    case RSErrorType.typesNotCompatible:
      return `Типы не совместимы для выбранной операции: ${error.params[0]} и ${error.params[1]}`;
    case RSErrorType.orderingNotSupported:
      return `Тип не поддерживает предикаты порядка: ${error.params[0]}`;
    case RSErrorType.globalNoValue:
      return `Используется неинтерпретируемый глобальный идентификатор: ${error.params[0]}`;
    case RSErrorType.invalidPropertyUsage:
      return `Использование неитерируемого множества в качестве значения`;
    case RSErrorType.globalMissingAST:
      return `Не удалось получить дерево разбора для глобального идентификатора: ${error.params[0]}`;
    case RSErrorType.globalFuncNoInterpretation:
      return 'Функция не интерпретируется для данных аргументов';

    case RSErrorType.cstNonemptyBase:
      return 'Непустое выражение базисного/константного множества';
    case RSErrorType.cstEmptyDerived:
      return 'Пустое выражение для сложного понятия или утверждения';
    case RSErrorType.cstCallableNoArgs:
      return 'Отсутствуют аргументы для параметризованной конституенты';
    case RSErrorType.cstNonCallableHasArgs:
      return 'Параметризованное выражение не подходит для данного типа конституенты';
    case RSErrorType.cstExpectedLogical:
      return 'Данный тип конституенты требует логического выражения';
    case RSErrorType.cstExpectedTyped:
      return 'Данный тип конституенты требует теоретико-множественного выражения';
  }
  return 'UNKNOWN ERROR';
}
