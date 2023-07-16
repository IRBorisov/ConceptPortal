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
    entityUID: number
    alias: string
    cstType: CstType
    convention?: string
    term?: {
        raw: string
        resolved?: string
    }
    definition?: {
        formal: string
        text: {
            raw: string
            resolved?: string
        }
    }
    parse?: {
        status: string
        valueClass: ValueClass
        typification: string
        syntaxTree: string
    }
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
}

// RSForm data
export interface IRSFormCreateData {
    title: string
    alias: string
    comment: string
    is_common: boolean
    file?: File
}

export function GetTypeLabel(cst: IConstituenta) {
    if (cst.parse?.typification) {
        return cst.parse.typification;
    }
    if (cst.parse?.status !==  ParsingStatus.VERIFIED) {
        return 'N/A';
    }
    return 'Логический';
}

export function GetErrLabel(cst: IConstituenta) {
    if (!cst.parse?.status) {
        return 'N/A';
    }
    if (cst.parse?.status ===  ParsingStatus.UNDEF) {
        return 'неизв';
    }
    if (cst.parse?.status ===  ParsingStatus.INCORRECT) {
        return 'ошибка';
    }
    if (cst.parse?.valueClass ===  ValueClass.INVALID) {
        return 'невыч';
    }
    if (cst.parse?.valueClass ===  ValueClass.PROPERTY) {
        return 'св-во';
    }
    return 'ОК';
}

export function GetCstTypeLabel(type: CstType) {
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