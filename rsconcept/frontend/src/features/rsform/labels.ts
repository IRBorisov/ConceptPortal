/**
 * Generates description for {@link IConstituenta}.
 */

import { PARAMETER } from '@/utils/constants';
import { type RO } from '@/utils/meta';
import { prepareTooltip } from '@/utils/utils';

import { type IVersionInfo } from '../library/backend/types';
import { type CurrentVersion } from '../library/models/library';
import { TokenID } from '../rslang';

import { ParsingStatus } from './backend/types';
import { Grammeme, ReferenceType } from './models/language';
import { CstClass, CstType, ExpressionStatus, type IArgumentInfo, type IConstituenta } from './models/rsform';
import { CstMatchMode, DependencyMode } from './stores/cst-search';
import { type InteractionMode, type TGColoring, type TGEdgeType } from './stores/term-graph';

// --- Records for label/describe functions ---
const labelCstTypeRecord: Record<CstType, string> = {
  [CstType.NOMINAL]: 'Номиноид',
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

const labelGraphModeRecord: Record<InteractionMode, string> = {
  explore: 'Режим: Просмотр',
  edit: 'Режим: Редактор'
};

const labelColoringRecord: Record<TGColoring, string> = {
  none: 'Цвет: Моно',
  status: 'Цвет: Статус',
  type: 'Цвет: Класс',
  schemas: 'Цвет: Схемы'
};

const labelGraphTypeRecord: Record<TGEdgeType, string> = {
  full: 'Связь: Все',
  definition: 'Связь: Определение',
  attribution: 'Связь: Атрибутирование'
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

/** Retrieves label for {@link TGColoring}. */
export function labelColoring(mode: TGColoring): string {
  return labelColoringRecord[mode] ?? `UNKNOWN COLORING: ${mode}`;
}

/** Retrieves label for {@link InteractionMode}. */
export function labelGraphMode(mode: InteractionMode): string {
  return labelGraphModeRecord[mode] ?? `UNKNOWN GRAPH MODE: ${mode}`;
}

/** Retrieves label for {@link TGEdgeType}. */
export function labelEdgeType(mode: TGEdgeType): string {
  return labelGraphTypeRecord[mode] ?? `UNKNOWN GRAPH TYPE: ${mode}`;
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

/** Generates label for typification. */
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
    resultType = 'Logic';
  }
  if (args.length === 0) {
    return resultType;
  }
  const argsText = args.map(arg => arg.typification).join(', ');
  return `[${argsText}] → ${resultType}`;
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

