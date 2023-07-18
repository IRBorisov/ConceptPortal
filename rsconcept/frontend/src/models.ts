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