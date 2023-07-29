//! RS language token types enumeration
export enum TokenID {
  // Global, local IDs and literals
  ID_LOCAL = 258,
  ID_GLOBAL,
  ID_FUNCTION,
  ID_PREDICATE,
  ID_RADICAL,
  LIT_INTEGER,
  LIT_INTSET,
  LIT_EMPTYSET,

  // Aithmetic
  PLUS,
  MINUS,
  MULTIPLY,

  // Integer predicate symbols
  GREATER,
  LESSER,
  GREATER_OR_EQ,
  LESSER_OR_EQ,

  // Equality comparison
  EQUAL,
  NOTEQUAL,

  // Logic predicate symbols
  FORALL,
  EXISTS,
  NOT,
  EQUIVALENT,
  IMPLICATION,
  OR,
  AND,

  // Set theory predicate symbols
  IN,
  NOTIN,
  SUBSET,
  SUBSET_OR_EQ,
  NOTSUBSET,

  // Set theory operators
  DECART,
  UNION,
  INTERSECTION,
  SET_MINUS,
  SYMMINUS,
  BOOLEAN,

  // Structure operations
  BIGPR,
  SMALLPR,
  FILTER,
  CARD,
  BOOL,
  DEBOOL,
  REDUCE,

  // Term constructions prefixes
  DECLARATIVE,
  RECURSIVE,
  IMPERATIVE,

  // Punctuation
  PUNC_DEFINE,
  PUNC_STRUCT,
  PUNC_ASSIGN,
  PUNC_ITERATE,
  PUNC_PL,
  PUNC_PR,
  PUNC_CL,
  PUNC_CR,
  PUNC_SL,
  PUNC_SR,
  PUNC_BAR,
  PUNC_COMMA,
  PUNC_SEMICOLON,

  // ======= Non-terminal tokens =========
  NT_ENUM_DECL, // Перечисление переменных в кванторной декларации
  NT_TUPLE, // Кортеж (a,b,c), типизация B(T(a)xT(b)xT(c))
  NT_ENUMERATION, // Задание множества перечислением
  NT_TUPLE_DECL, // Декларация переменных с помощью кортежа
  NT_ARG_DECL, // Объявление аргумента

  NT_FUNC_DEFINITION, // Определение функции
  NT_ARGUMENTS, // Задание аргументов функции
  NT_FUNC_CALL, // Вызов функции

  NT_DECLARATIVE_EXPR, // Задание множества с помощью выражения D{x из H | A(x) }
  NT_IMPERATIVE_EXPR, // Императивное определение
  NT_RECURSIVE_FULL, // Полная рекурсия
  NT_RECURSIVE_SHORT, // Сокращенная рекурсия

  NT_IMP_DECLARE, // Блок декларации
  NT_IMP_ASSIGN, // Блок присвоения
  NT_IMP_LOGIC, // Блок проверки

  // ======= Helper tokens ========
  INTERRUPT,
  END,
}

export enum RSErrorClass {
  LEXER,
  PARSER,
  SEMANTIC,
  UNKNOWN
}

export enum RSErrorType {
  syntax = 0x8400, // Неизвестная синтаксическая ошибка
  missingParanthesis = 0x8406, // Пропущена скобка ')'
	missingCurlyBrace = 0x8407, // Пропущена скобка '}'
	invalidQuantifier = 0x8408, // Некорректная кванторная декларация
	expectedArgDeclaration = 0x8414, // Ожидалось объявление аргументов
	expectedLocal = 0x8415, // Ожидалось имя локальной переменной
  localDoubleDeclare = 0x2801, // Повторное использование одного и того же имени переменной
	localNotUsed = 0x2802, // Переменная объявлена но не использована

	localUndeclared = 0x8801, // Использование необъявленной переменной
	localShadowing = 0x8802, // Повторное объявление переменной

	typesNotEqual = 0x8803, // Некорректное использование операций
	globalNotTyped = 0x8804, // Не определена типизация глобальной конституенты
	invalidDecart = 0x8805, // Одна из проекций не является множеством
	invalidBoolean = 0x8806, // Попытка взять булеан от элемента, не имеющего характер множества
	invalidTypeOperation = 0x8807, // Применение ТМО к операндам, не имеющим характер множества
	invalidCard = 0x8808, // Мощность множества не определена для элемента
	invalidDebool = 0x8809, // Дебулеан берется от немножества
	globalFuncMissing = 0x880A, // Неизвестное имя функции
	globalFuncWithoutArgs = 0x880B, // Некорректное использование имени функции без аргументов
	invalidReduce = 0x8810, // Red можно брать только от двойного булеана
	invalidProjectionTuple = 0x8811, // Не определена проекция
	invalidProjectionSet = 0x8812, // Большая проекция определена только для множеств!
	invalidEnumeration = 0x8813, // Типизация аргументов перечисления не совпадает
	ivalidBinding = 0x8814, // Количество переменных в кортеже не соответствует размерности декартова произведения
	localOutOfScope = 0x8815, // Использование имени вне области видимости
	invalidElementPredicat = 0x8816, // Несоответствие типов для проверки принадлежности
	invalidArgsArtity = 0x8818, // Некорректное количество аргументов терм-функции
	invalidArgumentType = 0x8819, // Типизация аргумента не совпадает с объявленной
	invalidEqualsEmpty = 0x881A, // Сравнение с пустым множеством не множества
	globalStructure = 0x881C, // Родовая структура должна быть ступенью
  globalExpectedFunction = 0x881F, // Ожидалось выражение объявления функции
	emptySetUsage = 0x8820, // Некорректное использование пустого множества как типизированного выражения
	radicalUsage = 0x8821, // Радикалы запрещены вне деклараций терм-функций
	invalidFilterArgumentType = 0x8822, // Типизация аргумента фильтра не корректна
	invalidFilterArity = 0x8823, // Количество параметров фильра не соответствует количеству индексов
	arithmeticNotSupported = 0x8824, // Для данного типа не поддерживается арифметика
	typesNotCompatible = 0x8825, // Типы не совместимы в данном контексте
	orderingNotSupported = 0x8826, // Для данного типа не поддерживается порядок элементов

	globalNoValue = 0x8840, // Используется неинтерпретируемый глобальный идентификатор
	invalidPropertyUsage = 0x8841, // Использование свойства в качестве значения
	globalMissingAST = 0x8842, // Не удалось получить дерево разбора для глобального идентификатора
	globalFuncNoInterpretation = 0x8843, // Функция не интерпретируется для данных аргументов
}

const ERRCODE_LEXER_MASK = 0x0200;
const ERRCODE_PARSER_MASK = 0x0400;
const ERRCODE_TYPE_MASK = 0x0800;
export function resolveErrorClass(error: RSErrorType): RSErrorClass {
	if ((error & ERRCODE_LEXER_MASK) != 0) {
		return RSErrorClass.LEXER;
	} else if ((error & ERRCODE_PARSER_MASK) != 0) {
		return RSErrorClass.PARSER;
	} else if ((error & ERRCODE_TYPE_MASK) != 0) {
		return RSErrorClass.SEMANTIC;
	} else {
		return RSErrorClass.UNKNOWN;
	}
}
