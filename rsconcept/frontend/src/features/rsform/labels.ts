/**
 * Generates description for {@link IConstituenta}.
 */

import { PARAMETER } from '@/utils/constants';
import { type RO } from '@/utils/meta';
import { prepareTooltip } from '@/utils/utils';

import { type IVersionInfo } from '../library/backend/types';
import { type CurrentVersion } from '../library/models/library';

import { CstType, type IRSErrorDescription, ParsingStatus, RSErrorType, TokenID } from './backend/types';
import { Grammeme, ReferenceType } from './models/language';
import { CstClass, ExpressionStatus, type IConstituenta } from './models/rsform';
import { type IArgumentInfo, type ISyntaxTreeNode } from './models/rslang';
import { CstMatchMode, DependencyMode } from './stores/cst-search';
import { type GraphColoring } from './stores/term-graph';

// --- Records for label/describe functions ---
const labelCstTypeRecord: Record<CstType, string> = {
  [CstType.NOMINAL]: 'Номеноид',
  [CstType.BASE]: 'Базисное множество',
  [CstType.CONSTANT]: 'Константное множество',
  [CstType.STRUCTURED]: 'Родовая структура',
  [CstType.AXIOM]: 'Аксиома',
  [CstType.TERM]: 'Терм',
  [CstType.FUNCTION]: 'Терм-функция',
  [CstType.PREDICATE]: 'Предикат-функция',
  [CstType.THEOREM]: 'Теорема'
};

const labelReferenceTypeRecord: Record<ReferenceType, string> = {
  [ReferenceType.ENTITY]: 'Использование термина',
  [ReferenceType.SYNTACTIC]: 'Связывание слов'
};

const labelCstClassRecord: Record<CstClass, string> = {
  [CstClass.NOMINAL]: 'номинальный',
  [CstClass.BASIC]: 'базовый',
  [CstClass.DERIVED]: 'производный',
  [CstClass.STATEMENT]: 'утверждение',
  [CstClass.TEMPLATE]: 'шаблон'
};

const describeCstClassRecord: Record<CstClass, string> = {
  [CstClass.NOMINAL]: 'номинальная сущность',
  [CstClass.BASIC]: 'неопределяемое понятие',
  [CstClass.DERIVED]: 'определяемое понятие',
  [CstClass.STATEMENT]: 'логическое утверждение',
  [CstClass.TEMPLATE]: 'шаблон определения'
};

const labelColoringRecord: Record<GraphColoring, string> = {
  none: 'Цвет: Моно',
  status: 'Цвет: Статус',
  type: 'Цвет: Класс',
  schemas: 'Цвет: Схемы'
};

const labelCstMatchModeRecord: Record<CstMatchMode, string> = {
  [CstMatchMode.ALL]: 'фильтр',
  [CstMatchMode.EXPR]: 'выражение',
  [CstMatchMode.TERM]: 'термин',
  [CstMatchMode.TEXT]: 'текст',
  [CstMatchMode.NAME]: 'имя'
};

const describeCstMatchModeRecord: Record<CstMatchMode, string> = {
  [CstMatchMode.ALL]: 'все атрибуты',
  [CstMatchMode.EXPR]: 'формальное определение',
  [CstMatchMode.TERM]: 'термин',
  [CstMatchMode.TEXT]: 'определение и конвенция',
  [CstMatchMode.NAME]: 'только имена'
};

const labelCstSourceRecord: Record<DependencyMode, string> = {
  [DependencyMode.ALL]: 'граф',
  [DependencyMode.OUTPUTS]: 'потребители',
  [DependencyMode.INPUTS]: 'поставщики',
  [DependencyMode.EXPAND_OUTPUTS]: 'зависимые',
  [DependencyMode.EXPAND_INPUTS]: 'влияющие'
};

const describeCstSourceRecord: Record<DependencyMode, string> = {
  [DependencyMode.ALL]: 'все конституенты',
  [DependencyMode.OUTPUTS]: 'прямые исходящие',
  [DependencyMode.INPUTS]: 'прямые входящие',
  [DependencyMode.EXPAND_OUTPUTS]: 'цепочка исходящих',
  [DependencyMode.EXPAND_INPUTS]: 'цепочка входящих'
};

const labelExpressionStatusRecord: Record<ExpressionStatus, string> = {
  [ExpressionStatus.VERIFIED]: 'корректно',
  [ExpressionStatus.INCORRECT]: 'ошибка',
  [ExpressionStatus.INCALCULABLE]: 'невычислимо',
  [ExpressionStatus.PROPERTY]: 'неразмерное',
  [ExpressionStatus.UNKNOWN]: 'не проверено',
  [ExpressionStatus.UNDEFINED]: 'N/A'
};

const describeExpressionStatusRecord: Record<ExpressionStatus, string> = {
  [ExpressionStatus.VERIFIED]: 'корректно и вычислимо',
  [ExpressionStatus.INCORRECT]: 'обнаружена ошибка',
  [ExpressionStatus.INCALCULABLE]: 'интерпретация не вычисляется',
  [ExpressionStatus.PROPERTY]: 'только проверка принадлежности',
  [ExpressionStatus.UNKNOWN]: 'требуется проверка',
  [ExpressionStatus.UNDEFINED]: 'ошибка при проверке'
};

const labelGrammemeRecord: Partial<Record<Grammeme, string>> = {
  [Grammeme.NOUN]: 'ЧР: сущ',
  [Grammeme.VERB]: 'ЧР: глагол',
  [Grammeme.INFN]: 'ЧР: глагол инф',
  [Grammeme.ADJF]: 'ЧР: прил',
  [Grammeme.PRTF]: 'ЧР: прич',
  [Grammeme.ADJS]: 'ЧР: кр прил',
  [Grammeme.PRTS]: 'ЧР: кр прич',
  [Grammeme.COMP]: 'ЧР: компаратив',
  [Grammeme.GRND]: 'ЧР: деепричастие',
  [Grammeme.NUMR]: 'ЧР: число',
  [Grammeme.ADVB]: 'ЧР: наречие',
  [Grammeme.NPRO]: 'ЧР: местоимение',
  [Grammeme.PRED]: 'ЧР: предикатив',
  [Grammeme.PREP]: 'ЧР: предлог',
  [Grammeme.CONJ]: 'ЧР: союз',
  [Grammeme.PRCL]: 'ЧР: частица',
  [Grammeme.INTJ]: 'ЧР: междометие',
  [Grammeme.Abbr]: 'ЧР: аббревиатура',
  [Grammeme.sing]: 'Число: един',
  [Grammeme.plur]: 'Число: множ',
  [Grammeme.nomn]: 'Падеж: имен',
  [Grammeme.gent]: 'Падеж: род',
  [Grammeme.datv]: 'Падеж: дат',
  [Grammeme.accs]: 'Падеж: вин',
  [Grammeme.ablt]: 'Падеж: твор',
  [Grammeme.loct]: 'Падеж: пред',
  [Grammeme.masc]: 'Род: муж',
  [Grammeme.femn]: 'Род: жен',
  [Grammeme.neut]: 'Род: ср',
  [Grammeme.perf]: 'Совершенный: да',
  [Grammeme.impf]: 'Совершенный: нет',
  [Grammeme.tran]: 'Переходный: да',
  [Grammeme.intr]: 'Переходный: нет',
  [Grammeme.pres]: 'Время: настоящее',
  [Grammeme.past]: 'Время: прошедшее',
  [Grammeme.futr]: 'Время: будущее',
  [Grammeme.per1]: 'Лицо: 1',
  [Grammeme.per2]: 'Лицо: 2',
  [Grammeme.per3]: 'Лицо: 3',
  [Grammeme.impr]: 'Повелительный: да',
  [Grammeme.indc]: 'Повелительный: нет',
  [Grammeme.incl]: 'Включающий: да',
  [Grammeme.excl]: 'Включающий: нет',
  [Grammeme.pssv]: 'Страдательный: да',
  [Grammeme.actv]: 'Страдательный: нет',
  [Grammeme.anim]: 'Одушевленный: да',
  [Grammeme.inan]: 'Одушевленный: нет',
  [Grammeme.Infr]: 'Стиль: неформальный',
  [Grammeme.Slng]: 'Стиль: жаргон',
  [Grammeme.Arch]: 'Стиль: устаревший',
  [Grammeme.Litr]: 'Стиль: литературный'
};

const labelRSExpressionsRecord: Record<CstType, string> = {
  [CstType.NOMINAL]: 'Определяющие конституенты',
  [CstType.BASE]: 'Формальное определение',
  [CstType.CONSTANT]: 'Формальное определение',
  [CstType.STRUCTURED]: 'Область определения',
  [CstType.TERM]: 'Формальное определение',
  [CstType.THEOREM]: 'Формальное определение',
  [CstType.AXIOM]: 'Формальное определение',
  [CstType.FUNCTION]: 'Определение функции',
  [CstType.PREDICATE]: 'Определение функции'
};

const rsDefinitionPlaceholderRecord: Record<CstType, string> = {
  [CstType.NOMINAL]: 'Например, X1 D1 N1',
  [CstType.BASE]: 'Не предусмотрено',
  [CstType.CONSTANT]: 'Не предусмотрено',
  [CstType.STRUCTURED]: 'Пример: ℬ(X1×D2)',
  [CstType.TERM]: 'Пример: D{ξ∈S1 | Pr1(ξ)∩Pr2(ξ)=∅}',
  [CstType.THEOREM]: 'Пример: D11=∅',
  [CstType.AXIOM]: 'Пример: D11=∅',
  [CstType.FUNCTION]: 'Пример: [α∈X1, β∈ℬ(X1×X2)] Pr2(Fi1[{α}](β))',
  [CstType.PREDICATE]: 'Пример: [α∈X1, β∈ℬ(X1)] α∈β & card(β)>1'
};

const cstTypeShortcutKeyRecord: Record<CstType, string> = {
  [CstType.BASE]: '1',
  [CstType.STRUCTURED]: '2',
  [CstType.TERM]: '3',
  [CstType.AXIOM]: '4',
  [CstType.FUNCTION]: 'Q',
  [CstType.PREDICATE]: 'W',
  [CstType.CONSTANT]: '5',
  [CstType.THEOREM]: '6',
  [CstType.NOMINAL]: '7'
};

const labelTokenRecord: Partial<Record<TokenID, string>> = {
  [TokenID.BOOLEAN]: 'ℬ()',
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

const describeTokenRecord: Partial<Record<TokenID, string>> = {
  [TokenID.BOOLEAN]: prepareTooltip('Булеан', 'Alt + E / Shift + B'),
  [TokenID.DECART]: prepareTooltip('Декартово произведение', 'Alt + Shift + E / Shift + 8'),
  [TokenID.PUNCTUATION_PL]: prepareTooltip('Скобки () вокруг выражения', 'Alt + Shift + 9'),
  [TokenID.PUNCTUATION_SL]: prepareTooltip('Скобки [] вокруг выражения', 'Alt + ['),
  [TokenID.QUANTOR_UNIVERSAL]: prepareTooltip('Квантор всеобщности', '`'),
  [TokenID.QUANTOR_EXISTS]: prepareTooltip('Квантор существования', 'Shift + `'),
  [TokenID.LOGIC_NOT]: prepareTooltip('Отрицание', 'Alt + `'),
  [TokenID.LOGIC_AND]: prepareTooltip('Конъюнкция', 'Alt + 3 ~ Shift + 7'),
  [TokenID.LOGIC_OR]: prepareTooltip('Дизъюнкция', 'Alt + Shift + 3'),
  [TokenID.LOGIC_IMPLICATION]: prepareTooltip('Импликация', 'Alt + 4'),
  [TokenID.LOGIC_EQUIVALENT]: prepareTooltip('Эквивалентность', 'Alt + Shift + 4'),
  [TokenID.LIT_EMPTYSET]: prepareTooltip('Пустое множество', 'Alt + X'),
  [TokenID.LIT_WHOLE_NUMBERS]: prepareTooltip('Целые числа', 'Alt + Z'),
  [TokenID.EQUAL]: prepareTooltip('Равенство'),
  [TokenID.MULTIPLY]: prepareTooltip('Умножение чисел', 'Alt + 8'),
  [TokenID.NOTEQUAL]: prepareTooltip('Неравенство', 'Alt + Shift + `'),
  [TokenID.GREATER_OR_EQ]: prepareTooltip('Больше или равно', 'Alt + Shift + 7'),
  [TokenID.LESSER_OR_EQ]: prepareTooltip('Меньше или равно', 'Alt + Shift + 8'),
  [TokenID.SET_IN]: prepareTooltip('Быть элементом (принадлежит)', 'Alt + 1'),
  [TokenID.SET_NOT_IN]: prepareTooltip('Не принадлежит', 'Alt + Shift + 1'),
  [TokenID.SUBSET_OR_EQ]: prepareTooltip('Быть частью (нестрогое подмножество)', 'Alt + 2'),
  [TokenID.SUBSET]: prepareTooltip('Строгое подмножество', 'Alt + 7'),
  [TokenID.NOT_SUBSET]: prepareTooltip('Не подмножество', 'Alt + Shift + 2'),
  [TokenID.SET_INTERSECTION]: prepareTooltip('Пересечение', 'Alt + A'),
  [TokenID.SET_UNION]: prepareTooltip('Объединение', 'Alt + S'),
  [TokenID.SET_MINUS]: prepareTooltip('Разность множеств', 'Alt + 5'),
  [TokenID.SET_SYMMETRIC_MINUS]: prepareTooltip('Симметрическая разность', 'Alt + Shift + 5'),
  [TokenID.NT_DECLARATIVE_EXPR]: prepareTooltip('Декларативное определение', 'Alt + D'),
  [TokenID.NT_IMPERATIVE_EXPR]: prepareTooltip('Императивное определение', 'Alt + G'),
  [TokenID.NT_RECURSIVE_FULL]: prepareTooltip('Рекурсивное определение (цикл)', 'Alt + T'),
  [TokenID.BIGPR]: prepareTooltip('Большая проекция', 'Alt + Q'),
  [TokenID.SMALLPR]: prepareTooltip('Малая проекция', 'Alt + W'),
  [TokenID.FILTER]: prepareTooltip('Фильтр', 'Alt + F'),
  [TokenID.REDUCE]: prepareTooltip('Множество-сумма', 'Alt + R'),
  [TokenID.CARD]: prepareTooltip('Мощность', 'Alt + C'),
  [TokenID.BOOL]: prepareTooltip('Синглетон', 'Alt + B'),
  [TokenID.DEBOOL]: prepareTooltip('Десинглетон', 'Alt + V'),
  [TokenID.ASSIGN]: prepareTooltip('Присвоение', 'Alt + Shift + 6'),
  [TokenID.ITERATE]: prepareTooltip('Перебор элементов множества', 'Alt + 6')
};

/**
 * Generates description for {@link IConstituenta}.
 */
export function describeConstituenta(cst: RO<IConstituenta>): string {
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
export function describeConstituentaTerm(cst: RO<IConstituenta> | null): string {
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
export function labelConstituenta(cst: RO<IConstituenta>) {
  return `${cst.alias}: ${describeConstituenta(cst)}`;
}

/**
 * Generates label for {@link IVersionInfo} of {@link IRSForm}.
 */
export function labelVersion(value: CurrentVersion, items: RO<IVersionInfo[]>) {
  const version = items.find(ver => ver.id === value);
  return version ? version.version : 'актуальная';
}

/**
 * Retrieves label for {@link TokenID}.
 */
export function labelToken(id: TokenID): string {
  return labelTokenRecord[id] ?? `no label: ${id}`;
}

/** Return shortcut description for {@link CstType}. */
export function getCstTypeShortcut(type: CstType) {
  const key = cstTypeShortcutKeyRecord[type];
  return key ? `${labelCstType(type)} [Alt + ${key}]` : labelCstType(type);
}

/** Generates label for RS expression based on {@link CstType}. */
export function labelRSExpression(type: CstType): string {
  return labelRSExpressionsRecord[type] ?? 'Формальное выражение';
}

/** Generates placeholder for RS definition based on {@link CstType}. */
export function getRSDefinitionPlaceholder(type: CstType): string {
  return rsDefinitionPlaceholderRecord[type] ?? 'Формальное выражение';
}

/**
 * Generates description for {@link TokenID}.
 */
export function describeToken(id: TokenID): string {
  return describeTokenRecord[id] ?? `no description: ${id}`;
}

/**
 * Retrieves label for {@link CstMatchMode}.
 */
export function labelCstMatchMode(mode: CstMatchMode): string {
  return labelCstMatchModeRecord[mode] ?? `UNKNOWN MATCH MODE: ${mode}`;
}

/**
 * Retrieves description for {@link CstMatchMode}.
 */
export function describeCstMatchMode(mode: CstMatchMode): string {
  return describeCstMatchModeRecord[mode] ?? `UNKNOWN MATCH MODE: ${mode}`;
}

/** Retrieves label for {@link DependencyMode}. */
export function labelCstSource(mode: DependencyMode): string {
  return labelCstSourceRecord[mode];
}

/**
 * Retrieves description for {@link DependencyMode}.
 */
export function describeCstSource(mode: DependencyMode): string {
  return describeCstSourceRecord[mode] ?? `UNKNOWN DEPENDENCY MODE: ${mode}`;
}

/** Retrieves label for {@link GraphColoring}. */
export function labelColoring(mode: GraphColoring): string {
  return labelColoringRecord[mode] ?? `UNKNOWN COLORING: ${mode}`;
}

/**
 * Retrieves label for {@link ExpressionStatus}.
 */
export function labelExpressionStatus(status: ExpressionStatus): string {
  return labelExpressionStatusRecord[status] ?? `UNKNOWN EXPRESSION STATUS: ${status}`;
}

/**
 * Retrieves description for {@link ExpressionStatus}.
 */
export function describeExpressionStatus(status: ExpressionStatus): string {
  return describeExpressionStatusRecord[status] ?? `UNKNOWN EXPRESSION STATUS: ${status}`;
}

/**
 * Retrieves label for {@link CstType}.
 */
export function labelCstType(target: CstType): string {
  return labelCstTypeRecord[target] ?? `UNKNOWN CST TYPE: ${target}`;
}

/**
 * Retrieves label for {@link ReferenceType}.
 */
export function labelReferenceType(target: ReferenceType): string {
  return labelReferenceTypeRecord[target] ?? `UNKNOWN REFERENCE TYPE: ${target}`;
}

/**
 * Retrieves label for {@link CstClass}.
 */
export function labelCstClass(target: CstClass): string {
  return labelCstClassRecord[target] ?? `UNKNOWN CST CLASS: ${target}`;
}

/**
 * Retrieves description for {@link CstClass}.
 */
export function describeCstClass(target: CstClass): string {
  return describeCstClassRecord[target] ?? `UNKNOWN CST CLASS: ${target}`;
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
  args: RO<IArgumentInfo[]>;
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
  return `[${argsText}] 🠖 ${resultType}`;
}

/**
 * Generates label for {@link IConstituenta} typification.
 */
export function labelCstTypification(cst: RO<IConstituenta>): string {
  if (!cst.parse) {
    return 'N/A';
  }
  return labelTypification({
    isValid: cst.parse.status === ParsingStatus.VERIFIED,
    resultType: cst.parse.typification,
    args: cst.parse.args
  });
}

/**
 * Generates label for grammeme.
 */
export function labelGrammeme(gram: Grammeme): string {
  return labelGrammemeRecord[gram] ?? `Неизв: ${gram as string}`;
}

/**
 * Generates label for {@link ISyntaxTreeNode}.
 */
export function labelSyntaxTree(node: RO<ISyntaxTreeNode>): string {
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
  if (node.data.value) {
    return node.data.value as string;
  }
  return 'UNKNOWN ' + String(node.typeID);
}

/**
 * Generates error description for {@link IRSErrorDescription}.
 */
export function describeRSError(error: RO<IRSErrorDescription>): string {
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
      return `τ(α×b) = 𝔅(𝔇τ(α)×𝔇τ(b)). Некорректная типизация аргумента: ${error.params[0]}`;
    case RSErrorType.invalidBoolean:
      return `τ(ℬ(a)) = 𝔅𝔅𝔇τ(a). Некорректная типизация аргумента: ${error.params[0]}`;
    case RSErrorType.invalidTypeOperation:
      return `Типизация операнда теоретико-множественной операции не корректна: ${error.params[0]}`;
    case RSErrorType.invalidCard:
      return `Некорректная типизация аргумента операции мощности: ${error.params[0]}`;
    case RSErrorType.invalidDebool:
      return `τ(debool(a)) = 𝔇τ(a). Некорректная типизация аргумента: ${error.params[0]}`;
    case RSErrorType.globalFuncMissing:
      return `Неизвестное имя функции: ${error.params[0]}`;
    case RSErrorType.globalFuncWithoutArgs:
      return `Некорректное использование имени функции без аргументов: ${error.params[0]}`;
    case RSErrorType.invalidReduce:
      return `τ(red(a)) = 𝔅𝔇𝔇τ(a). Некорректная типизация аргумента: ${error.params[0]}`;
    case RSErrorType.invalidProjectionTuple:
      return `Проекция не определена: ${error.params[0]} -> ${error.params[1]}`;
    case RSErrorType.invalidProjectionSet:
      return `τ(Pri(a)) = 𝔅𝒞i𝔇τ(a). Некорректная типизация аргумента: ${error.params[0]} -> ${error.params[1]}`;
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
