
import { DependencyMode } from '../models/miscelanious';
import { HelpTopic } from '../models/miscelanious';
import { CstMatchMode } from '../models/miscelanious';
import { ExpressionStatus } from '../models/rsform';
import { CstClass, CstType, IConstituenta, IRSForm } from '../models/rsform';
import { IFunctionArg, IRSErrorDescription, ISyntaxTreeNode, ParsingStatus, ValueClass } from '../models/rslang';
import { resolveErrorClass, RSErrorClass, RSErrorType, TokenID } from '../models/rslang';
import { IColorTheme } from './color';

export interface IDescriptor {
  text: string
  tooltip: string
}

export function getCstDescription(cst: IConstituenta): string {
  if (cst.cst_type === CstType.STRUCTURED) {
    return (
      cst.term_resolved || cst.term_raw || 
      cst.definition_resolved || cst.definition_raw || 
      cst.convention || 
      cst.definition_formal
    );
  } else {
    return (
      cst.term_resolved || cst.term_raw || 
      cst.definition_resolved || cst.definition_raw || 
      cst.definition_formal || 
      cst.convention
    );
  }
}

export function getCstLabel(cst: IConstituenta) {
  return `${cst.alias}: ${getCstDescription(cst)}`;
}

export function getCstTypePrefix(type: CstType) {
  switch (type) {
  case CstType.BASE: return 'X';
  case CstType.CONSTANT: return 'C';
  case CstType.STRUCTURED: return 'S';
  case CstType.AXIOM: return 'A';
  case CstType.TERM: return 'D';
  case CstType.FUNCTION: return 'F';
  case CstType.PREDICATE: return 'P';
  case CstType.THEOREM: return 'T';
  }
}

export function getCstExpressionPrefix(cst: IConstituenta): string {
  return cst.alias + (cst.cst_type === CstType.STRUCTURED ? '::=' : ':==');
}

export function getRSButtonData(id: TokenID): IDescriptor {
  switch (id) {
  case TokenID.BOOLEAN: return {
    text: 'ℬ()',
    tooltip: 'Булеан [Alt + E]'
  };
  case TokenID.DECART: return {
    text: '×',
    tooltip: 'Декартово произведение [Shift + 8  / Alt + Shift + E]'
  };
  case TokenID.PUNC_PL: return {
    text: '( )',
    tooltip: 'Скобки вокруг выражения [Alt + Shift + 9 ]'
  };
  case TokenID.PUNC_SL: return {
    text: '[ ]',
    tooltip: 'Скобки вокруг выражения [Alt + [ ]'
  };
  case TokenID.FORALL: return {
    text: '∀',
    tooltip: 'Квантор всеобщности [`]'
  };
  case TokenID.EXISTS: return {
    text: '∃',
    tooltip: 'Квантор существования [Shift + `]'
  };
  case TokenID.NOT: return {
    text: '¬',
    tooltip: 'Отрицание [Alt + `]'
  };
  case TokenID.AND: return {
    text: '&',
    tooltip: 'Конъюнкция [Alt + 3 ~ Shift + 7]'
  };
  case TokenID.OR: return {
    text: '∨',
    tooltip: 'дизъюнкция [Alt + Shift + 3]'
  };
  case TokenID.IMPLICATION: return {
    text: '⇒',
    tooltip: 'импликация [Alt + 4]'
  };
  case TokenID.EQUIVALENT: return {
    text: '⇔',
    tooltip: 'эквивалентность [Alt + Shift + 4]'
  };
  case TokenID.LIT_EMPTYSET: return {
    text: '∅',
    tooltip: 'пустое множество [Alt + X]'
  };
  case TokenID.LIT_INTSET: return {
    text: 'Z',
    tooltip: 'целые числа [Alt + Z]'
  };
  case TokenID.EQUAL: return {
    text: '=',
    tooltip: 'равенство'
  };
  case TokenID.NOTEQUAL: return {
    text: '≠',
    tooltip: 'неравенство [Alt + Shift + `]'
  };
  case TokenID.GREATER_OR_EQ: return {
    text: '≥',
    tooltip: 'больше или равно'
  };
  case TokenID.LESSER_OR_EQ: return {
    text: '≤',
    tooltip: 'меньше или равно'
  };
  case TokenID.IN: return {
    text: '∈',
    tooltip: 'быть элементом (принадлежит) [Alt + 1]'
  };
  case TokenID.NOTIN: return {
    text: '∉',
    tooltip: 'не принадлежит [Alt + Shift + 1]'
  };
  case TokenID.SUBSET_OR_EQ: return {
    text: '⊆',
    tooltip: 'быть частью (нестрогое подмножество) [Alt + 2]'
  };
  case TokenID.SUBSET: return {
    text: '⊂',
    tooltip: 'строгое подмножество [Alt + ;]'
  };
  case TokenID.NOTSUBSET: return {
    text: '⊄',
    tooltip: 'не подмножество [Alt + Shift + 2]'
  };
  case TokenID.INTERSECTION: return {
    text: '∩',
    tooltip: 'пересечение [Alt + Y]'
  };
  case TokenID.UNION: return {
    text: '∪',
    tooltip: 'объединение [Alt + U]'
  };
  case TokenID.SET_MINUS: return {
    text: '\\',
    tooltip: 'Разность множеств [Alt + 5]'
  };
  case TokenID.SYMMINUS: return {
    text: '∆',
    tooltip: 'Симметрическая разность [Alt + Shift + 5]'
  };
  case TokenID.NT_DECLARATIVE_EXPR: return {
    text: 'D{}',
    tooltip: 'Декларативная форма определения терма [Alt + D]'
  };
  case TokenID.NT_IMPERATIVE_EXPR: return {
    text: 'I{}',
    tooltip: 'императивная форма определения терма [Alt + G]'
  };
  case TokenID.NT_RECURSIVE_FULL: return {
    text: 'R{}',
    tooltip: 'рекурсивная (цикличная) форма определения терма [Alt + T]'
  };
  case TokenID.BIGPR: return {
    text: 'Pr1()',
    tooltip: 'большая проекция [Alt + Q]'
  };
  case TokenID.SMALLPR: return {
    text: 'pr1()',
    tooltip: 'малая проекция [Alt + W]'
  };
  case TokenID.FILTER: return {
    text: 'Fi1[]()',
    tooltip: 'фильтр [Alt + F]'
  };
  case TokenID.REDUCE: return {
    text: 'red()',
    tooltip: 'множество-сумма [Alt + R]'
  };
  case TokenID.CARD: return {
    text: 'card()',
    tooltip: 'мощность [Alt + C]'
  };
  case TokenID.BOOL: return {
    text: 'bool()',
    tooltip: 'синглетон [Alt + B]'
  };
  case TokenID.DEBOOL: return {
    text: 'debool()',
    tooltip: 'десинглетон [Alt + V]'
  };
  case TokenID.PUNC_ASSIGN: return {
    text: ':=',
    tooltip: 'присвоение (императивный синтаксис) [Alt + Shift + 6]'
  };
  case TokenID.PUNC_ITERATE: return {
    text: ':∈',
    tooltip: 'перебор элементов множества (императивный синтаксис) [Alt + 6]'
  };
  }
  return {
    text: 'undefined',
    tooltip: 'undefined'
  }
}

export function getCstTypeLabel(type: CstType) {
  switch (type) {
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

export function getCstTypeShortcut(type: CstType) {
  const prefix = getCstTypeLabel(type) + ' [Alt + ';
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

export function getCstCompareLabel(mode: CstMatchMode): string {
  switch(mode) {
    case CstMatchMode.ALL: return 'везде';
    case CstMatchMode.EXPR: return 'выраж';
    case CstMatchMode.TERM: return 'термин';
    case CstMatchMode.TEXT: return 'текст';
    case CstMatchMode.NAME: return 'имя';
  }
}

export function getDependencyLabel(mode: DependencyMode): string {
  switch(mode) {
    case DependencyMode.ALL: return 'вся схема';
    case DependencyMode.EXPRESSION: return 'выражение';
    case DependencyMode.OUTPUTS: return 'потребители';
    case DependencyMode.INPUTS: return 'поставщики';
    case DependencyMode.EXPAND_INPUTS: return 'влияющие';
    case DependencyMode.EXPAND_OUTPUTS: return 'зависимые';
  }
}

export const mapLayoutLabels: Map<string, string> = new Map([
  ['forceatlas2', 'Граф: Атлас 2D'],
  ['forceDirected2d', 'Граф: Силы 2D'],
  ['forceDirected3d', 'Граф: Силы 3D'],
  ['treeTd2d', 'Граф: ДеревоВерт 2D'],
  ['treeTd3d', 'Граф: ДеревоВерт 3D'],
  ['treeLr2d', 'Граф: ДеревоГор 2D'],
  ['treeLr3d', 'Граф: ДеревоГор 3D'],
  ['radialOut2d', 'Граф: Радиальная 2D'],
  ['radialOut3d', 'Граф: Радиальная 3D'],
  ['circular2d', 'Граф: Круговая'],
  ['hierarchicalTd', 'Граф: ИерархияВерт'],
  ['hierarchicalLr', 'Граф: ИерархияГор'],
  ['nooverlap', 'Граф: Без перекрытия']
]);

export const mapColoringLabels: Map<string, string> = new Map([
  ['none', 'Цвет: моно'],
  ['status', 'Цвет: статус'],
  ['type', 'Цвет: класс'],
]);

export function getCstStatusBgColor(status: ExpressionStatus, colors: IColorTheme): string {
  switch (status) {
  case ExpressionStatus.VERIFIED: return colors.bgGreen;
  case ExpressionStatus.INCORRECT: return colors.bgRed;
  case ExpressionStatus.INCALCULABLE: return colors.bgOrange;
  case ExpressionStatus.PROPERTY: return colors.bgTeal;
  case ExpressionStatus.UNKNOWN: return colors.bgBlue;
  case ExpressionStatus.UNDEFINED: return colors.bgBlue;
  }
}

export function getCstStatusFgColor(status: ExpressionStatus, colors: IColorTheme): string {
  switch (status) {
  case ExpressionStatus.VERIFIED: return colors.fgGreen;
  case ExpressionStatus.INCORRECT: return colors.fgRed;
  case ExpressionStatus.INCALCULABLE: return colors.fgOrange;
  case ExpressionStatus.PROPERTY: return colors.fgTeal;
  case ExpressionStatus.UNKNOWN: return colors.fgBlue;
  case ExpressionStatus.UNDEFINED: return colors.fgBlue;
  }
}

export const mapStatusInfo: Map<ExpressionStatus, IDescriptor> = new Map([
  [ ExpressionStatus.VERIFIED, {
    text: 'ок',
    tooltip: 'выражение корректно и вычислимо'
  }],
  [ ExpressionStatus.INCORRECT, {
    text: 'ошибка',
    tooltip: 'ошибка в выражении'
  }],
  [ ExpressionStatus.INCALCULABLE, {
    text: 'невыч',
    tooltip: 'выражение не вычислимо'
  }],
  [ ExpressionStatus.PROPERTY, {
    text: 'св-во',
    tooltip: 'можно проверить принадлежность, но нельзя получить значение'
  }],
  [ ExpressionStatus.UNKNOWN, {
    text: 'неизв',
    tooltip: 'требует проверки выражения'
  }],
  [ ExpressionStatus.UNDEFINED, {
    text: 'N/A',
    tooltip: 'произошла ошибка при проверке выражения'
  }]
]);

export const mapTopicInfo: Map<HelpTopic, IDescriptor> = new Map([
  [ HelpTopic.MAIN, {
    text: 'Портал',
    tooltip: 'Общая справка по порталу'
  }],
  [ HelpTopic.RSLANG, {
    text: 'Рода структур',
    tooltip: 'Справка по языку родов структур и экспликации'
  }],
  [ HelpTopic.LIBRARY, {
    text: 'Библиотека',
    tooltip: 'Интерфейс работы с библиотекой схем'
  }],
  [ HelpTopic.RSFORM, {
    text: '- паспорт схемы',
    tooltip: 'Интерфейс работы с описанием схемы'
  }],
  [ HelpTopic.CSTLIST, {
    text: '- список конституент',
    tooltip: 'Интерфейс работы со списком конституент'
  }],
  [ HelpTopic.CONSTITUENTA, {
    text: '- конституента',
    tooltip: 'Интерфейс редактирования конституенты'
  }],
  [ HelpTopic.GRAPH_TERM, {
    text: '- граф термов',
    tooltip: 'Интерфейс работ с графом термов схемы'
  }],
  [ HelpTopic.EXTEOR, {
    text: 'Экстеор',
    tooltip: 'Справка по программе Экстеор'
  }],
  [ HelpTopic.API, {
    text: 'REST API',
    tooltip: 'Документация интерфейса для разработчиков'
  }],
]);

export function getCstClassColor(cstClass: CstClass, colors: IColorTheme): string {
  switch (cstClass) {
    case CstClass.BASIC: return colors.bgGreen;
    case CstClass.DERIVED: return colors.bgBlue;
    case CstClass.STATEMENT: return colors.bgRed;
    case CstClass.TEMPLATE: return colors.bgTeal;
  }
}

export const mapCstClassInfo: Map<CstClass, IDescriptor> = new Map([
  [ CstClass.BASIC, {
    text: 'базовый',
    tooltip: 'неопределяемое понятие, требует конвенции'
  }],
  [ CstClass.DERIVED, {
    text: 'производный',
    tooltip: 'выводимое понятие, задаваемое определением'
  }],
  [ CstClass.STATEMENT, {
    text: 'утверждение',
    tooltip: 'неопределяемое понятие, требует конвенции'
  }],
  [ CstClass.TEMPLATE, {
    text: 'шаблон',
    tooltip: 'параметризованный шаблон определения'
  }],
]);

export function createAliasFor(type: CstType, schema: IRSForm): string {
  const prefix = getCstTypePrefix(type);
  if (!schema.items || schema.items.length <= 0) {
    return `${prefix}1`;
  }
  const index = schema.items.reduce((prev, cst, index) => {
    if (cst.cst_type !== type) {
      return prev;
    }
    index = Number(cst.alias.slice(1 - cst.alias.length)) + 1;
    return Math.max(prev, index);
  }, 1);
  return `${prefix}${index}`;
}

export function getMockConstituenta(schema: number, id: number, alias: string, type: CstType, comment: string): IConstituenta {
  return {
    id: id,
    order: -1,
    schema: schema,
    alias: alias,
    convention: comment,
    cst_type: type,
    term_raw: '',
    term_resolved: '',
    term_forms: [],
    definition_formal: '',
    definition_raw: '',
    definition_resolved: '',
    status: ExpressionStatus.INCORRECT,
    is_template: false,
    cst_class: CstClass.DERIVED,
    parse: {
      status: ParsingStatus.INCORRECT,
      valueClass: ValueClass.INVALID,
      typification: 'N/A',
      syntaxTree: '',
      args: []
    }
  };
}

export function getCloneTitle(schema: IRSForm): string {
  if (!schema.title.includes('[клон]')) {
    return schema.title + ' [клон]';
  } else {
    return (schema.title + '+');
  }
}

export function getTypificationLabel({isValid, resultType, args}: {
  isValid: boolean,
  resultType: string,
  args: IFunctionArg[]
}): string {
  if (!isValid) {
    return 'N/A';
  }
  if (resultType === '' || resultType === 'LOGIC') {
    resultType = 'Логический';
  }
  if (args.length === 0) {
    return resultType;
  }
  const argsText = args.map(arg => arg.typification).join(', ');
  return `${resultType} 🠔 [${argsText}]`;
}

export function getCstTypificationLabel(cst: IConstituenta): string {
  return getTypificationLabel({
    isValid: cst.parse.status === ParsingStatus.VERIFIED,
    resultType: cst.parse.typification,
    args: cst.parse.args
  });
}

export function getRSErrorPrefix(error: IRSErrorDescription): string {
  const id = error.errorType.toString(16)
  switch(resolveErrorClass(error.errorType)) {
  case RSErrorClass.LEXER: return 'L' + id;
  case RSErrorClass.PARSER: return 'P' + id;
  case RSErrorClass.SEMANTIC: return 'S' + id;
  case RSErrorClass.UNKNOWN: return 'U' + id;
  }
}

export function getRSErrorMessage(error: IRSErrorDescription): string {
  switch (error.errorType) {
  case RSErrorType.syntax: 
    return 'Неопределенная синтаксическая ошибка';
  case RSErrorType.missingParanthesis: 
    return 'Некорректная конструкция языка родов структур, проверьте структуру выражения';
  case RSErrorType.missingCurlyBrace: 
    return "Пропущен символ '}'";
  case RSErrorType.invalidQuantifier: 
    return 'Некорректная кванторная декларация';
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
    return `τ(α×b) = ℬ(𝔇τ(α)×𝔇τ(b)). Некорректная типизация аргумента: ${error.params[0]}`;
  case RSErrorType.invalidBoolean: 
    return `τ(ℬ(a)) = ℬℬ𝔇τ(a). Некорректная типизация аргумента: ${error.params[0]}`;
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
    return `τ(red(a)) = ℬ𝔇𝔇τ(a). Некорректная типизация аргумента: ${error.params[0]}`;
  case RSErrorType.invalidProjectionTuple: 
    return `Проекция не определена: ${error.params[0]} -> ${error.params[1]}`;
  case RSErrorType.invalidProjectionSet: 
    return `τ(Pri(a)) = ℬ𝒞i𝔇τ(a). Некорректная типизация аргумента: ${error.params[0]}`;
  case RSErrorType.invalidEnumeration: 
    return `Типизация аргументов перечисления не совпадает: ${error.params[0]} != ${error.params[1]}`;
  case RSErrorType.ivalidBinding: 
    return `Количество переменных в кортеже не соответствует размерности декартова произведения`;
  case RSErrorType.localOutOfScope: 
    return `Использование имени переменной вне области действия: ${error.params[0]}`;
  case RSErrorType.invalidElementPredicat: 
    return `Несоответствие типизаций операндов для оператора: ${error.params[0]}${error.params[1]}${error.params[2]}`;
  case RSErrorType.invalidArgsArtity: 
    return `Неверное число аргументов терм-функции: ${error.params[0]} != ${error.params[1]}`;
  case RSErrorType.invalidArgumentType: 
    return `Типизация аргумента терм-функции не соответствует объявленной: ${error.params[0]} != ${error.params[1]}`;
  case RSErrorType.invalidEqualsEmpty: 
    return `Только множества можно сравнивать с пустым множеством: ${error.params[0]}`;
  case RSErrorType.globalStructure: 
    return `Выражение родовой структуры должно быть ступенью`;
  case RSErrorType.globalExpectedFunction: 
    return `Ожидалось выражение объявления функции`;
  case RSErrorType.emptySetUsage: 
    return `Запрещено использование пустого множества как типизированного выражения`;
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
    return `Функция не интерпретируется для данных аргументов`;  
  case RSErrorType.globalNonemptyBase: 
    return `Непустое выражение базисного/константного множества`;
  case RSErrorType.globalUnexpectedType: 
    return `Типизация выражения не соответствует типу конституенты`;
  }
  return 'UNKNOWN ERROR';
}

export function getASTNodeLabel(node: ISyntaxTreeNode): string {
  switch(node.typeID) {
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

  case TokenID.PLUS: return '+'
  case TokenID.MINUS: return '-'
  case TokenID.MULTIPLY: return '*'
  case TokenID.GREATER: return '>'
  case TokenID.LESSER: return '<'

  case TokenID.NT_TUPLE: return 'TUPLE'
  case TokenID.NT_ENUMERATION: return 'ENUM'

  case TokenID.NT_ENUM_DECL: return 'ENUM_DECLARATION'
  case TokenID.NT_TUPLE_DECL: return 'TUPLE_DECLARATION'
  case TokenID.PUNC_DEFINE: return 'DEFINITION'
  case TokenID.PUNC_STRUCT: return 'STRUCTURE_DEFITION'

  case TokenID.NT_ARG_DECL: return 'ARG'
  case TokenID.NT_FUNC_CALL: return 'CALL'
  case TokenID.NT_ARGUMENTS: return 'ARGS'

  case TokenID.NT_FUNC_DEFINITION: return 'FUNCTION_DEFINITION'
  case TokenID.NT_IMP_DECLARE: return 'IDECLARE'
  case TokenID.NT_IMP_ASSIGN: return 'IASSIGN'
  case TokenID.NT_IMP_LOGIC: return 'ICHECK'

  case TokenID.NT_RECURSIVE_SHORT: return getRSButtonData(TokenID.NT_RECURSIVE_FULL).text;
  
  case TokenID.BOOLEAN:
  case TokenID.DECART:
  case TokenID.FORALL:
  case TokenID.EXISTS:
  case TokenID.NOT:
  case TokenID.AND:
  case TokenID.OR:
  case TokenID.IMPLICATION:
  case TokenID.EQUIVALENT:
  case TokenID.LIT_EMPTYSET:
  case TokenID.LIT_INTSET:
  case TokenID.EQUAL:
  case TokenID.NOTEQUAL:
  case TokenID.GREATER_OR_EQ:
  case TokenID.LESSER_OR_EQ:
  case TokenID.IN:
  case TokenID.NOTIN:
  case TokenID.SUBSET_OR_EQ:
  case TokenID.SUBSET:
  case TokenID.NOTSUBSET:
  case TokenID.INTERSECTION:
  case TokenID.UNION:
  case TokenID.SET_MINUS:
  case TokenID.SYMMINUS:
  case TokenID.NT_DECLARATIVE_EXPR:
  case TokenID.NT_IMPERATIVE_EXPR:
  case TokenID.NT_RECURSIVE_FULL:
  case TokenID.REDUCE:
  case TokenID.CARD:
  case TokenID.BOOL:
  case TokenID.DEBOOL:
  case TokenID.PUNC_ASSIGN:
  case TokenID.PUNC_ITERATE:
    return getRSButtonData(node.typeID).text;
  }
 // node
  return 'UNKNOWN ' + String(node.typeID);
}

export function getASTNodeColor(node: ISyntaxTreeNode, colors: IColorTheme): string {
  switch(node.typeID) {
  case TokenID.PUNC_DEFINE:
  case TokenID.PUNC_STRUCT:
  case TokenID.ID_LOCAL:
    return colors.bgGreen;
  
  case TokenID.ID_GLOBAL:
  case TokenID.ID_FUNCTION:
  case TokenID.ID_PREDICATE:
  case TokenID.ID_RADICAL:
  case TokenID.LIT_INTEGER:
  case TokenID.LIT_EMPTYSET:
  case TokenID.LIT_INTSET:
    return colors.bgTeal;
  
  case TokenID.FORALL:
  case TokenID.EXISTS:
  case TokenID.NOT:
  case TokenID.AND:
  case TokenID.OR:
  case TokenID.IMPLICATION:
  case TokenID.EQUIVALENT:
  case TokenID.GREATER:
  case TokenID.LESSER:
  case TokenID.EQUAL:
  case TokenID.NOTEQUAL:
  case TokenID.GREATER_OR_EQ:
  case TokenID.LESSER_OR_EQ:
  case TokenID.IN:
  case TokenID.NOTIN:
  case TokenID.SUBSET_OR_EQ:
  case TokenID.SUBSET:
  case TokenID.NOTSUBSET:
    return colors.bgOrange;
  
  case TokenID.NT_TUPLE:
  case TokenID.NT_ENUMERATION:
  case TokenID.BIGPR:
  case TokenID.SMALLPR:
  case TokenID.FILTER:
  case TokenID.PLUS:
  case TokenID.MINUS:
  case TokenID.MULTIPLY:
  case TokenID.BOOLEAN:
  case TokenID.DECART:
  case TokenID.INTERSECTION:
  case TokenID.UNION:
  case TokenID.SET_MINUS:
  case TokenID.SYMMINUS:
  case TokenID.REDUCE:
  case TokenID.CARD:
  case TokenID.BOOL:
  case TokenID.DEBOOL:
    return colors.bgBlue;

  case TokenID.NT_FUNC_DEFINITION:
  case TokenID.NT_DECLARATIVE_EXPR:
  case TokenID.NT_IMPERATIVE_EXPR:
  case TokenID.NT_RECURSIVE_FULL:
  case TokenID.NT_ENUM_DECL:
  case TokenID.NT_TUPLE_DECL:
  case TokenID.NT_ARG_DECL:
  case TokenID.NT_FUNC_CALL:
  case TokenID.NT_ARGUMENTS:
  case TokenID.NT_IMP_DECLARE:
  case TokenID.NT_IMP_ASSIGN:
  case TokenID.NT_IMP_LOGIC:
  case TokenID.NT_RECURSIVE_SHORT:
      return '';

  case TokenID.PUNC_ASSIGN:
  case TokenID.PUNC_ITERATE:
    return colors.bgRed;
  }
  // node
  return colors.bgRed;
}
