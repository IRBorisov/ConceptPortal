import { LayoutTypes } from 'reagraph';

import { resolveErrorClass,RSErrorClass, RSErrorType, TokenID } from './enums';
import { CstType, ExpressionStatus, type IConstituenta, IRSErrorDescription,type IRSForm, ParsingStatus, ValueClass } from './models';

export interface IRSButtonData {
  text: string
  tooltip: string
}

export interface IStatusInfo {
  text: string
  color: string
  tooltip: string
}

export function getTypeLabel(cst: IConstituenta) {
  if (cst.parse?.typification) {
    return cst.parse.typification;
  }
  if (cst.parse?.status !== ParsingStatus.VERIFIED) {
    return 'N/A';
  }
  return 'Логический';
}

export function getRSButtonData(id: TokenID): IRSButtonData {
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
    tooltip: 'Скобки вокруг выражения [ Alt + Shift + 9 ]'
  };
  case TokenID.PUNC_SL: return {
    text: '[ ]',
    tooltip: 'Скобки вокруг выражения [ Alt + [ ]'
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
    tooltip: 'быть элементом (принадлежит) [Alt + \']'
  };
  case TokenID.NOTIN: return {
    text: '∉',
    tooltip: 'не принадлежит [Alt + Shift + \']'
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
    tooltip: 'присвоение (императивный синтаксис)'
  };
  case TokenID.PUNC_ITERATE: return {
    text: ':∈',
    tooltip: 'перебор элементов множества (императивный синтаксис)'
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

export const CstTypeSelector = (Object.values(CstType)).map(
  (typeStr) => {
    const type = typeStr as CstType;
    return { value: type, label: getCstTypeLabel(type) };
});

export const GraphLayoutSelector: {value: LayoutTypes, label: string}[] = [
  { value: 'forceatlas2', label: 'forceatlas2'},
  { value: 'nooverlap', label: 'nooverlap'},
  { value: 'forceDirected2d', label: 'forceDirected2d'},
  { value: 'forceDirected3d', label: 'forceDirected3d'},
  { value: 'circular2d', label: 'circular2d'},
  { value: 'treeTd2d', label: 'treeTd2d'},
  { value: 'treeTd3d', label: 'treeTd3d'},
  { value: 'treeLr2d', label: 'treeLr2d'},
  { value: 'treeLr3d', label: 'treeLr3d'},
  { value: 'radialOut2d', label: 'radialOut2d'},
  { value: 'radialOut3d', label: 'radialOut3d'},
//  { value: 'hierarchicalTd', label: 'hierarchicalTd'},
//  { value: 'hierarchicalLr', label: 'hierarchicalLr'}
];

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

export function getStatusInfo(status?: ExpressionStatus): IStatusInfo {
  switch (status) {
  case ExpressionStatus.UNDEFINED: return {
    text: 'N/A',
    color: 'bg-[#b3bdff] dark:bg-[#1e00b3]',
    tooltip: 'произошла ошибка при проверке выражения'
  };
  case ExpressionStatus.UNKNOWN: return {
    text: 'неизв',
    color: 'bg-[#b3bdff] dark:bg-[#1e00b3]',
    tooltip: 'требует проверки выражения'
  };
  case ExpressionStatus.INCORRECT: return {
    text: 'ошибка',
    color: 'bg-[#ff8080] dark:bg-[#800000]',
    tooltip: 'ошибка в выражении'
  };
  case ExpressionStatus.INCALCULABLE: return {
    text: 'невыч',
    color: 'bg-[#ffbb80] dark:bg-[#964600]',
    tooltip: 'выражение не вычислимо (экспоненциальная сложность)'
  };
  case ExpressionStatus.PROPERTY: return {
    text: 'св-во',
    color: 'bg-[#a5e9fa] dark:bg-[#36899e]',
    tooltip: 'можно проверить принадлежность, но нельзя получить значение'
  };
  case ExpressionStatus.VERIFIED: return {
    text: 'ок',
    color: 'bg-[#aaff80] dark:bg-[#2b8000]',
    tooltip: 'выражение корректно и вычислимо'
  };
  }
  return {
    text: 'undefined',
    color: '',
    tooltip: '!ERROR!'
  };
}

export function createAliasFor(type: CstType, schema: IRSForm): string {
  const prefix = getCstTypePrefix(type);
  if (!schema.items || schema.items.length <= 0) {
    return `${prefix}1`;
  }
  const index = schema.items.reduce((prev, cst, index) => {
    if (cst.cstType !== type) {
      return prev;
    }
    index = Number(cst.alias.slice(1 - cst.alias.length)) + 1;
    return Math.max(prev, index);
  }, 1);
  return `${prefix}${index}`;
}

export function getMockConstituenta(id: number, alias: string, type: CstType, comment: string): IConstituenta {
  return {
    id: id,
    alias: alias,
    convention: comment,
    cstType: type,
    term: {
      raw: '',
      resolved: '',
      forms: []
    },
    definition: {
      formal: '',
      text: {
        raw: '',
        resolved: ''
      }
    },
    parse: {
      status: ParsingStatus.INCORRECT,
      valueClass: ValueClass.INVALID,
      typification: 'N/A',
      syntaxTree: ''
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
    return 'UNKNOWN SYNTAX ERROR';
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
    return `Предупреждение! Переменная объявлена но не использована: ${error.params[0]}`;
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
    return `Радикалы запрещены вне деклараций терм-функци: ${error.params[0]}`;
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
  }
  return 'UNKNOWN ERROR';
}
