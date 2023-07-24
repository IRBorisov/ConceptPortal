// Current user info
export interface ICurrentUser {
    id: number
    username: string
    is_staff: boolean
}

// User profile data
export interface IUserProfile {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
}

// User base info
export interface IUserInfo {
    id: number
    username: string
    first_name: string
    last_name: string
}

// User data for signup
export interface IUserSignupData {
    username: string
    email: string
    first_name: string
    last_name: string
    password: string
    password2: string
}

// User data for signup
export interface INewCstData {
    alias: string
    csttype: CstType
    insert_after?: number
}

// Constituenta type
export enum CstType {
    BASE = 'basic',
    CONSTANT = 'constant',
    STRUCTURED = 'structure',
    AXIOM = 'axiom',
    TERM = 'term',
    FUNCTION = 'function',
    PREDICATE = 'predicate',
    THEOREM = 'theorem'
}

// ValueClass
export enum ValueClass {
    INVALID = 'invalid',
    VALUE = 'value',
    PROPERTY = 'property'
}

// Syntax
export enum Syntax {
    UNDEF = 'undefined',
    ASCII = 'ascii',
    MATH = 'math'
}

// ParsingStatus
export enum ParsingStatus {
    UNDEF = 'undefined',
    VERIFIED = 'verified',
    INCORRECT = 'incorrect'
}

// Constituenta data
export interface IConstituenta {
    id: number
    alias: string
    cstType: CstType
    convention?: string
    term?: {
        raw: string
        resolved?: string
        forms?: string[]
    }
    definition?: {
        formal: string
        text: {
            raw: string
            resolved?: string
        }
    }
    parse?: {
        status: ParsingStatus
        valueClass: ValueClass
        typification: string
        syntaxTree: string
    }
}

// RSForm stats
export interface IRSFormStats {
    count_all: number
    count_errors: number
    count_property: number
    count_incalc: number

    count_termin: number

    count_base: number
    count_constant: number
    count_structured: number
    count_axiom: number
    count_term: number
    count_function: number
    count_predicate: number
    count_theorem: number
}

// RSForm data
export interface IRSForm {
    id: number
    title: string
    alias: string
    comment: string
    is_common: boolean
    time_create: string
    time_update: string
    owner?: number
    items?: IConstituenta[]
    stats?: IRSFormStats
}

// RSForm user input
export interface IRSFormCreateData {
    title: string
    alias: string
    comment: string
    is_common: boolean
    file?: File
}

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
	NT_TUPLE_DECL,  // Декларация переменных с помощью кортежа
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
};

// Constituenta edit mode
export enum EditMode {
    TEXT = 'text',
    RSLANG = 'rslang'
}

// RSExpression status
export enum ExpressionStatus {
    UNDEFINED = 0,
    UNKNOWN,
    INCORRECT,
    INCALCULABLE,
    PROPERTY,
    VERIFIED
}

export function inferStatus(parse?: ParsingStatus, value?: ValueClass): ExpressionStatus {
    if (!parse || !value) {
        return ExpressionStatus.UNDEFINED;
    }
    if (parse === ParsingStatus.UNDEF) {
        return ExpressionStatus.UNKNOWN;
    }
    if (parse === ParsingStatus.INCORRECT) {
        return ExpressionStatus.INCORRECT;
    }
    if (value === ValueClass.INVALID) {
        return ExpressionStatus.INCALCULABLE;
    }
    if (value === ValueClass.PROPERTY) {
        return ExpressionStatus.PROPERTY;
    }
    return ExpressionStatus.VERIFIED
}

export function CalculateStats(schema: IRSForm) {
    if (!schema.items) {
        schema.stats = {
            count_all: 0,
            count_errors: 0,
            count_property: 0,
            count_incalc: 0,

            count_termin: 0,

            count_base: 0,
            count_constant: 0,
            count_structured: 0,
            count_axiom: 0,
            count_term: 0,
            count_function: 0,
            count_predicate: 0,
            count_theorem: 0,
        }
        return;
    }
    schema.stats = {
        count_all: schema.items?.length || 0,
        count_errors: schema.items?.reduce(
            (sum, cst) => sum +
                (cst.parse?.status === ParsingStatus.INCORRECT ? 1 : 0) || 0,
            0
        ),
        count_property: schema.items?.reduce(
            (sum, cst) => sum +
                (cst.parse?.valueClass === ValueClass.PROPERTY ? 1 : 0) || 0,
            0
        ),
        count_incalc: schema.items?.reduce(
            (sum, cst) => sum +
                ((cst.parse?.status === ParsingStatus.VERIFIED &&
                    cst.parse?.valueClass === ValueClass.INVALID) ? 1 : 0) || 0,
            0
        ),

        count_termin: schema.items?.reduce(
            (sum, cst) => (sum +
                (cst.term?.raw ? 1 : 0) || 0),
            0
        ),

        count_base: schema.items?.reduce(
            (sum, cst) => sum +
                (cst.cstType === CstType.BASE ? 1 : 0),
            0
        ),
        count_constant: schema.items?.reduce(
            (sum, cst) => sum +
                (cst.cstType === CstType.CONSTANT ? 1 : 0),
            0
        ),
        count_structured: schema.items?.reduce(
            (sum, cst) => sum +
                (cst.cstType === CstType.STRUCTURED ? 1 : 0),
            0
        ),
        count_axiom: schema.items?.reduce(
            (sum, cst) => sum +
                (cst.cstType === CstType.AXIOM ? 1 : 0),
            0
        ),
        count_term: schema.items?.reduce(
            (sum, cst) => sum +
                (cst.cstType === CstType.TERM ? 1 : 0),
            0
        ),
        count_function: schema.items?.reduce(
            (sum, cst) => sum +
                (cst.cstType === CstType.FUNCTION ? 1 : 0),
            0
        ),
        count_predicate: schema.items?.reduce(
            (sum, cst) => sum +
                (cst.cstType === CstType.PREDICATE ? 1 : 0),
            0
        ),
        count_theorem: schema.items?.reduce(
            (sum, cst) => sum +
                (cst.cstType === CstType.THEOREM ? 1 : 0),
            0
        ),
    }
}

export function matchConstituenta(query: string, target?: IConstituenta) {
    if (!target) {
        return false;
    } else if (target.alias.match(query)) {
        return true;
    } else if (target.term?.resolved?.match(query)) {
        return true;
    } else if (target.definition?.formal.match(query)) {
        return true;
    } else if (target.definition?.text.resolved?.match(query)) {
        return true;
    } else if (target.convention?.match(query)) {
        return true;
    }else {
        return false;
    }
}