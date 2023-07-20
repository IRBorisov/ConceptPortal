import { CstType, ExpressionStatus, IConstituenta, ParsingStatus, TokenID } from './models';

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
  if (cst.parse?.status !==  ParsingStatus.VERIFIED) {
      return 'N/A';
  }
  return 'Логический';
}

export function getRSButtonData(id: TokenID): IRSButtonData {
  switch(id) {
  case TokenID.BOOLEAN: return {
    text: 'ℬ',
    tooltip: 'Булеан [Shift + B]',
  };
  case TokenID.DECART: return {
    text: '×',
    tooltip: 'Декартово произведение [Shift + 8]',
  };
  case TokenID.PUNC_PL: return {
    text: '( )',
    tooltip: 'Скобки вокруг выражения',
  };
  case TokenID.PUNC_SL: return {
    text: '[ ]',
    tooltip: 'Скобки вокруг выражения',
  };
  case TokenID.FORALL: return {
    text: '∀',
    tooltip: 'Квантор всеобщности [`]',
  };
  case TokenID.EXISTS: return {
    text: '∃',
    tooltip: 'Квантор существования [Shift + `]',
  };
  case TokenID.NOT: return {
    text: '¬',
    tooltip: 'Отрицание [Alt + Shift + -]',
  };
  case TokenID.AND: return {
    text: '&',
    tooltip: 'Конъюнкция [Shift + 7]',
  };
  case TokenID.OR: return {
    text: '∨',
    tooltip: 'дизъюнкция [Alt + Shift + 7]',
  };
  case TokenID.IMPLICATION: return {
    text: '⇒',
    tooltip: 'импликация [Alt + Shift + ]]',
  };
  case TokenID.EQUIVALENT: return {
    text: '⇔',
    tooltip: 'эквивалентность [Alt + Shift + []',
  };
  case TokenID.LIT_EMPTYSET: return {
    text: '∅',
    tooltip: 'пустое множество [Alt + Shift + 0]',
  };
  case TokenID.LIT_INTSET: return {
    text: 'Z',
    tooltip: 'целые числа',
  };
  case TokenID.EQUAL: return {
    text: '=',
    tooltip: 'равенство',
  };
  case TokenID.NOTEQUAL: return {
    text: '≠',
    tooltip: 'неравенство [Alt + Shift + =]',
  };
  case TokenID.GREATER_OR_EQ: return {
    text: '≥',
    tooltip: 'больше или равно',
  };
  case TokenID.LESSER_OR_EQ: return {
    text: '≤',
    tooltip: 'меньше или равно',
  };
  case TokenID.IN: return {
    text: '∈',
    tooltip: 'принадлежит [Alt + \']',
  };
  case TokenID.NOTIN: return {
    text: '∉',
    tooltip: 'не принадлежит [Alt + Shift + \']',
  };
  case TokenID.SUBSET_OR_EQ: return {
    text: '⊆',
    tooltip: 'быть частью (нестрогое подмножество) [Alt + Shift + L]',
  };
  case TokenID.SUBSET: return {
    text: '⊂',
    tooltip: 'строгое подмножество [Alt + ;]',
  };
  case TokenID.NOTSUBSET: return {
    text: '⊄',
    tooltip: 'не подмножество [Alt + Shift + ;]',
  };
  case TokenID.INTERSECTION: return {
    text: '∩',
    tooltip: 'пересечение [Alt + Y]',
  };
  case TokenID.UNION: return {
    text: '∪',
    tooltip: 'объединение [Alt + U]',
  };
  case TokenID.MINUS: return {
    text: '\\',
    tooltip: 'Разность множеств',
  };
  case TokenID.SYMMINUS: return {
    text: '∆',
    tooltip: 'Симметрическая разность',
  };
  case TokenID.NT_DECLARATIVE_EXPR: return {
    text: 'D{}',
    tooltip: 'Декларативная форма определения терма',
  };
  case TokenID.NT_IMPERATIVE_EXPR: return {
    text: 'I{}',
    tooltip: 'императивная форма определения терма',
  };
  case TokenID.NT_RECURSIVE_FULL: return {
    text: 'R{}',
    tooltip: 'рекурсивная (цикличная) форма определения терма',
  };
  case TokenID.BIGPR: return {
    text: 'Pr1()',
    tooltip: 'большая проекция [Alt + W]',
  };
  case TokenID.SMALLPR: return {
    text: 'pr1()',
    tooltip: 'малая проекция [Alt + Q]',
  };
  case TokenID.FILTER: return {
    text: 'Fi[]()',
    tooltip: 'фильтр [Alt + F]',
  };
  case TokenID.REDUCE: return {
    text: 'red()',
    tooltip: 'множество-сумма [Alt + R]',
  };
  case TokenID.CARD: return {
    text: 'card()',
    tooltip: 'мощность [Alt + C]',
  };
  case TokenID.BOOL: return {
    text: 'bool()',
    tooltip: 'синглетон [Alt + B]',
  };
  case TokenID.DEBOOL: return {
    text: 'debool()',
    tooltip: 'десинглетон [Alt + D]',
  };
  case TokenID.PUNC_ASSIGN: return {
    text: ':=',
    tooltip: 'присвоение (императивный синтаксис)',
  };
  case TokenID.PUNC_ITERATE: return {
    text: ':∈',
    tooltip: 'перебор элементов множества (императивный синтаксис)',
  };
  }
  return {
    text: 'undefined',
    tooltip: 'undefined',
  }
}

export function getCstTypeLabel(type: CstType) {
  switch(type) {
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

export function getCstTypePrefix(type: CstType) {
  switch(type) {
  case CstType.BASE: return 'X';
  case CstType.CONSTANT: return 'C';
  case CstType.STRUCTURED: return 'S';
  case CstType.AXIOM: return 'A';
  case CstType.TERM: return 'T';
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

export function extractGlobals(expression: string) {
  return expression.match(/[XCSADFPT]\d+/g) || [];
}