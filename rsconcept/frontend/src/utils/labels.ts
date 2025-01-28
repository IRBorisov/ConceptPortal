/**
 * Module: Text descriptors for UI and model elements.
 *
 * Label is a short text used to represent an entity.
 * Description is a long description used in tooltips.
 */
import { FolderNode } from '@/models/FolderTree';
import { GramData, Grammeme, ReferenceType } from '@/models/language';
import { AccessPolicy, LibraryItemType, LocationHead } from '@/models/library';
import { validateLocation } from '@/models/libraryAPI';
import { CstMatchMode, DependencyMode, GraphColoring, HelpTopic } from '@/models/miscellaneous';
import { ISubstitutionErrorDescription, OperationType, SubstitutionErrorType } from '@/models/oss';
import { CstClass, CstType, ExpressionStatus, IConstituenta, IRSForm } from '@/models/rsform';
import {
  IArgumentInfo,
  IRSErrorDescription,
  ISyntaxTreeNode,
  ParsingStatus,
  RSErrorType,
  TokenID
} from '@/models/rslang';
import { UserRole } from '@/models/user';

import { PARAMETER } from './constants';

/**
 * Remove html tags from target string.
 */
export function removeTags(target?: string): string {
  if (!target) {
    return '';
  }
  return target.toString().replace(/(<([^>]+)>)/gi, '');
}

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
export function describeConstituentaTerm(cst?: IConstituenta): string {
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
 * Generate HTML wrapper for control description including hotkey.
 */
export function prepareTooltip(text: string, hotkey?: string) {
  return hotkey ? `<b>[${hotkey}]</b><br/>${text}` : text;
}

/**
 * Generates label for {@link IVersionInfo} of {@link IRSForm}.
 */
export function labelVersion(schema?: IRSForm) {
  const version = schema?.versions.find(ver => ver.id === schema?.version);
  return version ? version.version : 'актуальная';
}

/**
 * Retrieves label for {@link TokenID}.
 */
export function labelToken(id: TokenID): string {
  // prettier-ignore
  switch (id) {
    case TokenID.BOOLEAN:             return 'ℬ()';
    case TokenID.DECART:              return '×';
    case TokenID.PUNCTUATION_PL:      return '( )';
    case TokenID.PUNCTUATION_SL:      return '[ ]';
    case TokenID.QUANTOR_UNIVERSAL:   return '∀';
    case TokenID.QUANTOR_EXISTS:      return '∃';
    case TokenID.LOGIC_NOT:           return '¬';
    case TokenID.LOGIC_AND:           return '&';
    case TokenID.LOGIC_OR:            return '∨';
    case TokenID.LOGIC_IMPLICATION:   return '⇒';
    case TokenID.LOGIC_EQUIVALENT:    return '⇔';
    case TokenID.LIT_EMPTYSET:        return '∅';
    case TokenID.LIT_WHOLE_NUMBERS:   return 'Z';
    case TokenID.MULTIPLY:            return '*';
    case TokenID.EQUAL:               return '=';
    case TokenID.NOTEQUAL:            return '≠';
    case TokenID.GREATER_OR_EQ:       return '≥';
    case TokenID.LESSER_OR_EQ:        return '≤';
    case TokenID.SET_IN:              return '∈';
    case TokenID.SET_NOT_IN:          return '∉';
    case TokenID.SUBSET_OR_EQ:        return '⊆';
    case TokenID.SUBSET:              return '⊂';
    case TokenID.NOT_SUBSET:          return '⊄';
    case TokenID.SET_INTERSECTION:    return '∩';
    case TokenID.SET_UNION:           return '∪';
    case TokenID.SET_MINUS:           return '\\';
    case TokenID.SET_SYMMETRIC_MINUS:   return '∆';
    case TokenID.NT_DECLARATIVE_EXPR:   return 'D{}';
    case TokenID.NT_IMPERATIVE_EXPR:    return 'I{}';
    case TokenID.NT_RECURSIVE_FULL:     return 'R{}';
    case TokenID.BIGPR:               return 'Pr1()';
    case TokenID.SMALLPR:             return 'pr1()';
    case TokenID.FILTER:              return 'Fi1[]()';
    case TokenID.REDUCE:              return 'red()';
    case TokenID.CARD:                return 'card()';
    case TokenID.BOOL:                return 'bool()';
    case TokenID.DEBOOL:              return 'debool()';
    case TokenID.ASSIGN:              return ':=';
    case TokenID.ITERATE:             return ':∈';
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

/** <b></b><br/>
 * Generates description for {@link TokenID}.
 */
export function describeToken(id: TokenID): string {
  // prettier-ignore
  switch (id) {
    case TokenID.BOOLEAN:               return prepareTooltip('Булеан', 'Alt + E / Shift + B');
    case TokenID.DECART:                return prepareTooltip('Декартово произведение', 'Alt + Shift + E / Shift + 8');
    case TokenID.PUNCTUATION_PL:        return prepareTooltip('Скобки () вокруг выражения', 'Alt + Shift + 9');
    case TokenID.PUNCTUATION_SL:        return prepareTooltip('Скобки [] вокруг выражения', 'Alt + [');
    case TokenID.QUANTOR_UNIVERSAL:     return prepareTooltip('Квантор всеобщности', '`');
    case TokenID.QUANTOR_EXISTS:        return prepareTooltip('Квантор существования', 'Shift + `');
    case TokenID.LOGIC_NOT:             return prepareTooltip('Отрицание', 'Alt + `');
    case TokenID.LOGIC_AND:             return prepareTooltip('Конъюнкция', 'Alt + 3 ~ Shift + 7');
    case TokenID.LOGIC_OR:              return prepareTooltip('Дизъюнкция', 'Alt + Shift + 3');
    case TokenID.LOGIC_IMPLICATION:     return prepareTooltip('Импликация', 'Alt + 4');
    case TokenID.LOGIC_EQUIVALENT:      return prepareTooltip('Эквивалентность', 'Alt + Shift + 4');
    case TokenID.LIT_EMPTYSET:          return prepareTooltip('Пустое множество', 'Alt + X');
    case TokenID.LIT_WHOLE_NUMBERS:     return prepareTooltip('Целые числа', 'Alt + Z');
    case TokenID.EQUAL:                 return prepareTooltip('Равенство');
    case TokenID.MULTIPLY:              return prepareTooltip('Умножение чисел', 'Alt + 8');
    case TokenID.NOTEQUAL:              return prepareTooltip('Неравенство', 'Alt + Shift + `');
    case TokenID.GREATER_OR_EQ:         return prepareTooltip('Больше или равно', 'Alt + Shift + 7');
    case TokenID.LESSER_OR_EQ:          return prepareTooltip('Меньше или равно', 'Alt + Shift + 8');
    case TokenID.SET_IN:                return prepareTooltip('Быть элементом (принадлежит)', 'Alt + 1');
    case TokenID.SET_NOT_IN:            return prepareTooltip('Не принадлежит', 'Alt + Shift + 1');
    case TokenID.SUBSET_OR_EQ:          return prepareTooltip('Быть частью (нестрогое подмножество)', 'Alt + 2');
    case TokenID.SUBSET:                return prepareTooltip('Строгое подмножество', 'Alt + 7');
    case TokenID.NOT_SUBSET:            return prepareTooltip('Не подмножество', 'Alt + Shift + 2');
    case TokenID.SET_INTERSECTION:      return prepareTooltip('Пересечение', 'Alt + A');
    case TokenID.SET_UNION:             return prepareTooltip('Объединение', 'Alt + S');
    case TokenID.SET_MINUS:             return prepareTooltip('Разность множеств', 'Alt + 5');
    case TokenID.SET_SYMMETRIC_MINUS:   return prepareTooltip('Симметрическая разность', 'Alt + Shift + 5');
    case TokenID.NT_DECLARATIVE_EXPR:   return prepareTooltip('Декларативное определение', 'Alt + D');
    case TokenID.NT_IMPERATIVE_EXPR:    return prepareTooltip('Императивное определение', 'Alt + G');
    case TokenID.NT_RECURSIVE_FULL:     return prepareTooltip('Рекурсивное определение (цикл)', 'Alt + T');
    case TokenID.BIGPR:                 return prepareTooltip('Большая проекция', 'Alt + Q');
    case TokenID.SMALLPR:               return prepareTooltip('Малая проекция', 'Alt + W');
    case TokenID.FILTER:                return prepareTooltip('Фильтр', 'Alt + F');
    case TokenID.REDUCE:                return prepareTooltip('Множество-сумма', 'Alt + R');
    case TokenID.CARD:                  return prepareTooltip('Мощность', 'Alt + C');
    case TokenID.BOOL:                  return prepareTooltip('Синглетон', 'Alt + B');
    case TokenID.DEBOOL:                return prepareTooltip('Десинглетон', 'Alt + V');
    case TokenID.ASSIGN:                return prepareTooltip('Присвоение', 'Alt + Shift + 6');
    case TokenID.ITERATE:               return prepareTooltip('Перебор элементов множества', 'Alt + 6');
  }
  return `no description: ${id}`;
}

/**
 * Retrieves label for {@link CstMatchMode}.
 */
export function labelCstMatchMode(mode: CstMatchMode): string {
  // prettier-ignore
  switch (mode) {
    case CstMatchMode.ALL:  return 'общий';
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
    case CstMatchMode.ALL:  return 'все атрибуты';
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
    case DependencyMode.ALL:            return 'не ограничен';
    case DependencyMode.OUTPUTS:        return 'потребители';
    case DependencyMode.INPUTS:         return 'поставщики';
    case DependencyMode.EXPAND_OUTPUTS: return 'зависимые';
    case DependencyMode.EXPAND_INPUTS:  return 'влияющие';
  }
}

/**
 * Retrieves description for {@link DependencyMode}.
 */
export function describeCstSource(mode: DependencyMode): string {
  // prettier-ignore
  switch (mode) {
    case DependencyMode.ALL:            return 'все конституенты';
    case DependencyMode.OUTPUTS:        return 'прямые исходящие';
    case DependencyMode.INPUTS:         return 'прямые входящие';
    case DependencyMode.EXPAND_OUTPUTS: return 'цепочка исходящих';
    case DependencyMode.EXPAND_INPUTS:  return 'цепочка входящих';
  }
}

/**
 * Retrieves label for {@link LocationHead}.
 */
export function labelLocationHead(head: LocationHead): string {
  // prettier-ignore
  switch (head) {
    case LocationHead.USER:      return '/U : личные';
    case LocationHead.COMMON:    return '/S : общие';
    case LocationHead.LIBRARY:   return '/L : примеры';
    case LocationHead.PROJECTS:  return '/P : проекты';
  }
}

/**
 * Retrieves description for {@link LocationHead}.
 */
export function describeLocationHead(head: LocationHead): string {
  // prettier-ignore
  switch (head) {
    case LocationHead.USER:      return 'Личные схемы пользователя';
    case LocationHead.COMMON:    return 'Рабочий каталог публичных схем';
    case LocationHead.LIBRARY:   return 'Каталог неизменных схем-примеров';
    case LocationHead.PROJECTS:  return 'Рабочий каталог проектных схем';
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
    case ExpressionStatus.VERIFIED:     return 'корректно';
    case ExpressionStatus.INCORRECT:    return 'ошибка';
    case ExpressionStatus.INCALCULABLE: return 'невычислимо';
    case ExpressionStatus.PROPERTY:     return 'неразмерное';
    case ExpressionStatus.UNKNOWN:      return 'не проверено';
    case ExpressionStatus.UNDEFINED:    return 'N/A';
  }
}

/**
 * Retrieves description for {@link ExpressionStatus}.
 */
export function describeExpressionStatus(status: ExpressionStatus): string {
  // prettier-ignore
  switch (status) {
    case ExpressionStatus.VERIFIED:     return 'выражение корректно и вычислимо';
    case ExpressionStatus.INCORRECT:    return 'ошибка в выражении';
    case ExpressionStatus.INCALCULABLE: return 'интерпретация не вычисляется';
    case ExpressionStatus.PROPERTY:     return 'только проверка принадлежности';
    case ExpressionStatus.UNKNOWN:      return 'требует проверки выражения';
    case ExpressionStatus.UNDEFINED:    return 'произошла ошибка при проверке';
  }
}

/**
 * Retrieves label for {@link HelpTopic}.
 */
export function labelHelpTopic(topic: HelpTopic): string {
  // prettier-ignore
  switch (topic) {
    case HelpTopic.MAIN:            return '🏠 Портал';

    case HelpTopic.THESAURUS:       return '📖 Тезаурус';

    case HelpTopic.INTERFACE:       return '🌀 Интерфейс';
    case HelpTopic.UI_LIBRARY:      return 'Библиотека';
    case HelpTopic.UI_RS_MENU:      return 'Меню схемы';
    case HelpTopic.UI_RS_CARD:      return 'Карточка схемы';
    case HelpTopic.UI_RS_LIST:      return 'Список конституент';
    case HelpTopic.UI_RS_EDITOR:    return 'Редактор конституенты';
    case HelpTopic.UI_GRAPH_TERM:   return 'Граф термов';
    case HelpTopic.UI_FORMULA_TREE: return 'Дерево разбора';
    case HelpTopic.UI_TYPE_GRAPH:   return 'Граф ступеней';
    case HelpTopic.UI_CST_STATUS:   return 'Статус конституенты';
    case HelpTopic.UI_CST_CLASS:    return 'Класс конституенты';
    case HelpTopic.UI_OSS_GRAPH:    return 'Граф синтеза';
    case HelpTopic.UI_SUBSTITUTIONS:return 'Отождествления';
    case HelpTopic.UI_RELOCATE_CST: return 'Перенос конституент';

    case HelpTopic.CONCEPTUAL:      return '♨️ Концептуализация';
    case HelpTopic.CC_SYSTEM:       return 'Система определений';
    case HelpTopic.CC_CONSTITUENTA: return 'Конституента';
    case HelpTopic.CC_RELATIONS:    return 'Связи понятий';
    case HelpTopic.CC_SYNTHESIS:    return 'Синтез схем';
    case HelpTopic.CC_OSS:          return 'Операционная схема';
    case HelpTopic.CC_PROPAGATION:  return 'Сквозные изменения';

    case HelpTopic.RSLANG:          return '🚀 Экспликация';
    case HelpTopic.RSL_TYPES:       return 'Типизация';
    case HelpTopic.RSL_CORRECT:     return 'Переносимость';
    case HelpTopic.RSL_INTERPRET:   return 'Интерпретируемость';
    case HelpTopic.RSL_OPERATIONS:  return 'Операции';
    case HelpTopic.RSL_TEMPLATES:   return 'Банк выражений';

    case HelpTopic.TERM_CONTROL:    return '🪸 Терминологизация';
    case HelpTopic.ACCESS:          return '🔐 Доступы';
    case HelpTopic.VERSIONS:        return '🏺 Версионирование';

    case HelpTopic.INFO:            return '📰 Информация';
    case HelpTopic.INFO_RULES:      return 'Правила';
    case HelpTopic.INFO_CONTRIB:    return 'Разработчики';
    case HelpTopic.INFO_PRIVACY:    return 'Обработка данных';
    case HelpTopic.INFO_API:        return 'REST API';

    case HelpTopic.EXTEOR:          return '🖥️ Экстеор';
  }
}

/**
 * Retrieves description for {@link HelpTopic}.
 */
export function describeHelpTopic(topic: HelpTopic): string {
  // prettier-ignore
  switch (topic) {
    case HelpTopic.MAIN:            return 'общая справка по порталу';

    case HelpTopic.THESAURUS:       return 'термины Портала';

    case HelpTopic.INTERFACE:       return 'описание интерфейса пользователя';
    case HelpTopic.UI_LIBRARY:      return 'поиск и просмотр схем';
    case HelpTopic.UI_RS_MENU:      return 'меню редактирования схемы';
    case HelpTopic.UI_RS_CARD:      return 'общие атрибуты схемы';
    case HelpTopic.UI_RS_LIST:      return 'концептуальная схема <br/>в форме таблицы';
    case HelpTopic.UI_RS_EDITOR:    return 'редактирование конституенты';
    case HelpTopic.UI_GRAPH_TERM:   return 'интерфейс графа термов';
    case HelpTopic.UI_FORMULA_TREE: return 'просмотр дерева разбора <br/>родоструктурного выражения';
    case HelpTopic.UI_TYPE_GRAPH:   return 'просмотр графа ступеней';
    case HelpTopic.UI_CST_STATUS:   return 'нотация статуса конституенты';
    case HelpTopic.UI_CST_CLASS:    return 'нотация класса конституенты';
    case HelpTopic.UI_OSS_GRAPH:    return 'графическая форма <br/>операционной схемы синтеза';
    case HelpTopic.UI_SUBSTITUTIONS:return 'таблица отождествлений конституент';
    case HelpTopic.UI_RELOCATE_CST: return 'перенос конституент<br/>в рамках ОСС';

    case HelpTopic.CONCEPTUAL:      return 'основы концептуализации';
    case HelpTopic.CC_SYSTEM:       return 'концептуальная схема <br/>как система понятий';
    case HelpTopic.CC_CONSTITUENTA: return 'понятия конституенты и ее атрибутов';
    case HelpTopic.CC_RELATIONS:    return 'отношения между конституентами';
    case HelpTopic.CC_SYNTHESIS:    return 'операция синтеза концептуальных схем';
    case HelpTopic.CC_OSS:          return 'операционная схема синтеза';
    case HelpTopic.CC_PROPAGATION:  return 'сквозные изменения в ОСС';

    case HelpTopic.RSLANG:          return 'экспликация и язык родов структур';
    case HelpTopic.RSL_TYPES:       return 'система типов в <br/>родоструктурной экспликации';
    case HelpTopic.RSL_CORRECT:     return 'биективная переносимость';
    case HelpTopic.RSL_INTERPRET:   return 'интерпретация определений <br/>и утверждений';
    case HelpTopic.RSL_OPERATIONS:  return 'формальные операции';
    case HelpTopic.RSL_TEMPLATES:   return 'применение Банка выражений';

    case HelpTopic.TERM_CONTROL:    return 'контроль терминов и текстовых отсылок';
    case HelpTopic.ACCESS:          return 'организация доступов к схемам';
    case HelpTopic.VERSIONS:        return 'справка по управлению версиями схем';

    case HelpTopic.INFO:            return 'справочные, нормативные <br/>и технические документы';
    case HelpTopic.INFO_RULES:      return 'правила пользования Порталом';
    case HelpTopic.INFO_CONTRIB:    return 'признание вклада <br/>в создание Портала';
    case HelpTopic.INFO_PRIVACY:    return 'политика обработки <br/>персональных данных';
    case HelpTopic.INFO_API:        return 'интерфейс для разработчиков';

    case HelpTopic.EXTEOR:          return 'программа экспликации теорий <br/>"Экстеор" для Windows';
  }
}

/**
 * Retrieves label for {@link CstType}.
 */
export function labelCstType(target: CstType): string {
  // prettier-ignore
  switch (target) {
    case CstType.BASE:          return 'Базисное множество';
    case CstType.CONSTANT:      return 'Константное множество';
    case CstType.STRUCTURED:    return 'Родовая структура';
    case CstType.AXIOM:         return 'Аксиома';
    case CstType.TERM:          return 'Терм';
    case CstType.FUNCTION:      return 'Терм-функция';
    case CstType.PREDICATE:     return 'Предикат-функция';
    case CstType.THEOREM:       return 'Теорема';
  }
}

/**
 * Retrieves label for {@link ReferenceType}.
 */
export function labelReferenceType(target: ReferenceType): string {
  // prettier-ignore
  switch(target) {
    case ReferenceType.ENTITY:    return 'Использование термина';
    case ReferenceType.SYNTACTIC: return 'Связывание слов';
  }
}

/**
 * Retrieves label for {@link CstClass}.
 */
export function labelCstClass(target: CstClass): string {
  // prettier-ignore
  switch (target) {
    case CstClass.BASIC:        return 'базовый';
    case CstClass.DERIVED:      return 'производный';
    case CstClass.STATEMENT:    return 'утверждение';
    case CstClass.TEMPLATE:     return 'шаблон';
  }
}

/**
 * Retrieves description for {@link CstClass}.
 */
export function describeCstClass(target: CstClass): string {
  // prettier-ignore
  switch (target) {
    case CstClass.BASIC:        return 'неопределяемое понятие';
    case CstClass.DERIVED:      return 'определяемое понятие';
    case CstClass.STATEMENT:    return 'логическое утверждение';
    case CstClass.TEMPLATE:     return 'шаблон определения';
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

/**
 * Generates error description for {@link ISubstitutionErrorDescription}.
 */
export function describeSubstitutionError(error: ISubstitutionErrorDescription): string {
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

/**
 * Retrieves label for {@link UserRole}.
 */
export function labelAccessMode(mode: UserRole): string {
  // prettier-ignore
  switch (mode) {
    case UserRole.READER:     return 'Читатель';
    case UserRole.EDITOR:     return 'Редактор';
    case UserRole.OWNER:      return 'Владелец';
    case UserRole.ADMIN:      return 'Администратор';
  }
}

/**
 * Retrieves description for {@link UserRole}.
 */
export function describeAccessMode(mode: UserRole): string {
  // prettier-ignore
  switch (mode) {
    case UserRole.READER:
      return 'Режим запрещает редактирование';
    case UserRole.EDITOR:
      return 'Режим редактирования';
    case UserRole.OWNER:
      return 'Режим владельца';
    case UserRole.ADMIN:
      return 'Режим администратора';
  }
}

/**
 * Retrieves label for {@link FolderNode}.
 */
export function labelFolderNode(node: FolderNode): string {
  if (node.parent || !validateLocation('/' + node.text)) {
    return node.text;
  } else {
    return labelLocationHead(('/' + node.text) as LocationHead);
  }
}

/**
 * Retrieves description for {@link FolderNode}.
 */
export function describeFolderNode(node: FolderNode): string {
  return `${node.filesInside} | ${node.filesTotal}`;
}

/**
 * Retrieves label for {@link AccessPolicy}.
 */
export function labelAccessPolicy(policy: AccessPolicy): string {
  // prettier-ignore
  switch (policy) {
    case AccessPolicy.PRIVATE:     return 'Личный';
    case AccessPolicy.PROTECTED:   return 'Защищенный';
    case AccessPolicy.PUBLIC:      return 'Открытый';
  }
}

/**
 * Retrieves description for {@link AccessPolicy}.
 */
export function describeAccessPolicy(policy: AccessPolicy): string {
  // prettier-ignore
  switch (policy) {
    case AccessPolicy.PRIVATE:
      return 'Доступ только для владельца';
    case AccessPolicy.PROTECTED:
      return 'Доступ для владельца и редакторов';
    case AccessPolicy.PUBLIC:
      return 'Открытый доступ';
  }
}

/**
 * Retrieves label for {@link LibraryItemType}.
 */
export function labelLibraryItemType(itemType: LibraryItemType): string {
  // prettier-ignore
  switch (itemType) {
    case LibraryItemType.RSFORM:  return 'КС';
    case LibraryItemType.OSS:     return 'ОСС';
  }
}

/**
 * Retrieves description for {@link LibraryItemType}.
 */
export function describeLibraryItemType(itemType: LibraryItemType): string {
  // prettier-ignore
  switch (itemType) {
    case LibraryItemType.RSFORM:  return 'Концептуальная схема';
    case LibraryItemType.OSS:     return 'Операционная схема синтеза';
  }
}

/**
 * Retrieves label for {@link OperationType}.
 */
export function labelOperationType(itemType: OperationType): string {
  // prettier-ignore
  switch (itemType) {
    case OperationType.INPUT:     return 'Загрузка';
    case OperationType.SYNTHESIS: return 'Синтез';
  }
}

/**
 * Retrieves description for {@link OperationType}.
 */
export function describeOperationType(itemType: OperationType): string {
  // prettier-ignore
  switch (itemType) {
    case OperationType.INPUT:     return 'Загрузка концептуальной схемы в ОСС';
    case OperationType.SYNTHESIS: return 'Синтез концептуальных схем';
  }
}

/**
 * UI info descriptors.
 */
export const information = {
  changesSaved: 'Изменения сохранены',

  pathReady: 'Путь скопирован',
  substituteSingle: 'Отождествление завершено',
  reorderComplete: 'Упорядочение завершено',
  reindexComplete: 'Имена конституент обновлены',
  moveComplete: 'Перемещение завершено',
  linkReady: 'Ссылка скопирована',
  versionRestored: 'Загрузка версии завершена',
  locationRenamed: 'Ваши схемы перемещены',
  cloneComplete: (alias: string) => `Копия создана: ${alias}`,
  noDataToExport: 'Нет данных для экспорта',
  substitutionsCorrect: 'Таблица отождествлений прошла проверку',
  uploadSuccess: 'Схема загружена из файла',
  inlineSynthesisComplete: 'Встраивание завершено',

  newLibraryItem: 'Схема успешно создана',
  addedConstituents: (count: number) => `Добавлены конституенты: ${count}`,
  newUser: (username: string) => `Пользователь успешно создан: ${username}`,
  newVersion: (version: string) => `Версия создана: ${version}`,
  newConstituent: (alias: string) => `Конституента добавлена: ${alias}`,
  newOperation: (alias: string) => `Операция добавлена: ${alias}`,

  versionDestroyed: 'Версия удалена',
  itemDestroyed: 'Схема удалена',
  operationDestroyed: 'Операция удалена',
  operationExecuted: 'Операция выполнена',
  allOperationExecuted: 'Все операции выполнены',
  constituentsDestroyed: (count: number) => `Конституенты удалены: ${count}`
};

/**
 * UI error descriptors.
 */
export const errors = {
  astFailed: 'Невозможно построить дерево разбора',
  typeStructureFailed: 'Структура отсутствует',
  passwordsMismatch: 'Пароли не совпадают',
  imageFailed: 'Ошибка при создании изображения',
  reuseOriginal: 'Повторное использование удаляемой конституенты при отождествлении',
  substituteInherited: 'Нельзя удалять наследованные конституенты при отождествлении',
  inputAlreadyExists: 'Концептуальная схема с таким именем уже существует'
};

/**
 * UI tooltip descriptors.
 */
export const tooltips = {
  unsaved: 'Сохраните или отмените изменения',
  shareItem: (policy?: AccessPolicy) =>
    policy === AccessPolicy.PUBLIC ? 'Поделиться схемой' : 'Поделиться можно только <br/>открытой схемой'
};

/**
 * UI prompt messages.
 */
export const prompts = {
  promptUnsaved: 'Присутствуют несохраненные изменения. Продолжить без их учета?',
  deleteLibraryItem: 'Вы уверены, что хотите удалить данную схему?',
  deleteOSS:
    'Внимание!!\nУдаление операционной схемы приведет к удалению всех операций и собственных концептуальных схем.\nДанное действие нельзя отменить.\nВы уверены, что хотите удалить данную ОСС?',
  generateWordforms: 'Данное действие приведет к перезаписи словоформ при совпадении граммем. Продолжить?',
  restoreArchive: 'При восстановлении архивной версии актуальная схему будет заменена. Продолжить?',
  templateUndefined: 'Вы уверены, что хотите создать шаблонную конституенту не фиксируя аргументы?',
  ownerChange:
    'Вы уверены, что хотите изменить владельца? Вы потеряете право управления данной схемой. Данное действие отменить нельзя'
};

// ============== INTERNAL LABELS FOR DEVELOPERS TEXT ================
export function contextOutsideScope(contextName: string, contextState: string): string {
  return `${contextName} has to be used within <${contextState}>`;
}
