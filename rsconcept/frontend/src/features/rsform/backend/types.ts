import { z } from 'zod';

import { schemaLibraryItem, schemaVersionInfo } from '@/features/library/backend/types';

import { errorMsg } from '@/utils/labels';

/** Represents {@link IConstituenta} type. */
export enum CstType {
  BASE = 'basic',
  STRUCTURED = 'structure',
  TERM = 'term',
  AXIOM = 'axiom',
  FUNCTION = 'function',
  PREDICATE = 'predicate',
  CONSTANT = 'constant',
  THEOREM = 'theorem'
}

/** Represents syntax type. */
export enum Syntax {
  UNDEF = 'undefined',
  ASCII = 'ascii',
  MATH = 'math'
}

/** Represents computability class. */
export enum ValueClass {
  INVALID = 'invalid', // incalculable
  VALUE = 'value',
  PROPERTY = 'property'
}

/** Represents parsing status. */
export enum ParsingStatus {
  UNDEF = 'undefined',
  VERIFIED = 'verified',
  INCORRECT = 'incorrect'
}

/** Represents Constituenta basic persistent data. */
export type IConstituentaBasicsDTO = z.infer<typeof schemaConstituentaBasics>;

/** Represents {@link IConstituenta} data from server. */
export type IConstituentaDTO = z.infer<typeof schemaConstituenta>;

/** Represents data for {@link IRSForm} provided by backend. */
export type IRSFormDTO = z.infer<typeof schemaRSForm>;

/** Represents data, used for uploading {@link IRSForm} as file. */
export interface IRSFormUploadDTO {
  itemID: number;
  load_metadata: boolean;
  file: File;
  fileName: string;
}

/** Represents {@link IConstituenta} data, used in creation process. */
export type ICstCreateDTO = z.infer<typeof schemaCstCreate>;

/** Represents data response when creating {@link IConstituenta}. */
export type ICstCreatedResponse = z.infer<typeof schemaCstCreatedResponse>;

/** Represents data, used in updating persistent attributes in {@link IConstituenta}. */
export type ICstUpdateDTO = z.infer<typeof schemaCstUpdate>;

/** Represents data, used in renaming {@link IConstituenta}. */
export type ICstRenameDTO = z.infer<typeof schemaCstRename>;

/** Represents data, used in ordering a list of {@link IConstituenta}. */
export interface ICstMoveDTO {
  items: number[];
  move_to: number; // Note: 0-base index
}

/** Represents data response when creating producing structure of {@link IConstituenta}. */
export type IProduceStructureResponse = z.infer<typeof schemaProduceStructureResponse>;

/** Represents data, used in merging single {@link IConstituenta}. */
export type ICstSubstitute = z.infer<typeof schemaCstSubstitute>;

/** Represents input data for inline synthesis. */
export type IInlineSynthesisDTO = z.infer<typeof schemaInlineSynthesis>;

/** Represents {@link IConstituenta} data, used for checking expression. */
export interface ICheckConstituentaDTO {
  alias: string;
  cst_type: CstType;
  definition_formal: string;
}

/** Represents data, used in merging multiple {@link IConstituenta}. */
export type ICstSubstitutionsDTO = z.infer<typeof schemaCstSubstitutions>;

/**
 * Represents Constituenta list.
 */
export interface IConstituentaList {
  items: number[];
}

/** Represents parsing error description. */
export type IRSErrorDescription = z.infer<typeof schemaRSErrorDescription>;

/** Represents results of expression parse in RSLang. */
export type IExpressionParseDTO = z.infer<typeof schemaExpressionParse>;

/** Represents data response when creating {@link IVersionInfo}. */
export type IVersionCreatedResponse = z.infer<typeof schemaVersionCreatedResponse>;

/** Represents RSLang token types. */
export enum TokenID {
  // Global, local IDs and literals
  ID_LOCAL = 258,
  ID_GLOBAL,
  ID_FUNCTION,
  ID_PREDICATE,
  ID_RADICAL,
  LIT_INTEGER,
  LIT_WHOLE_NUMBERS,
  LIT_EMPTYSET,

  // Arithmetic
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
  QUANTOR_UNIVERSAL,
  QUANTOR_EXISTS,
  LOGIC_NOT,
  LOGIC_EQUIVALENT,
  LOGIC_IMPLICATION,
  LOGIC_OR,
  LOGIC_AND,

  // Set theory predicate symbols
  SET_IN,
  SET_NOT_IN,
  SUBSET,
  SUBSET_OR_EQ,
  NOT_SUBSET,

  // Set theory operators
  DECART,
  SET_UNION,
  SET_INTERSECTION,
  SET_MINUS,
  SET_SYMMETRIC_MINUS,
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

  ITERATE,
  ASSIGN,

  // Punctuation
  PUNCTUATION_DEFINE,
  PUNCTUATION_STRUCT,
  PUNCTUATION_PL,
  PUNCTUATION_PR,
  PUNCTUATION_CL,
  PUNCTUATION_CR,
  PUNCTUATION_SL,
  PUNCTUATION_SR,
  PUNCTUATION_BAR,
  PUNCTUATION_COMMA,
  PUNCTUATION_SEMICOLON,

  // ======= Non-terminal tokens =========
  NT_ENUM_DECL,
  NT_TUPLE,
  NT_ENUMERATION,
  NT_TUPLE_DECL,
  NT_ARG_DECL,

  NT_FUNC_DEFINITION,
  NT_ARGUMENTS,
  NT_FUNC_CALL,

  NT_DECLARATIVE_EXPR,
  NT_IMPERATIVE_EXPR,
  NT_RECURSIVE_FULL,
  NT_RECURSIVE_SHORT,

  // ======= Helper tokens ========
  INTERRUPT,
  END
}

/** Represents RSLang expression error types. */
export enum RSErrorType {
  unknownSymbol = 33283,
  syntax = 33792,
  missingParenthesis = 33798,
  missingCurlyBrace = 33799,
  invalidQuantifier = 33800,
  invalidImperative = 33801,
  expectedArgDeclaration = 33812,
  expectedLocal = 33813,
  localDoubleDeclare = 10241,
  localNotUsed = 10242,

  localUndeclared = 34817,
  localShadowing = 34818,

  typesNotEqual = 34819,
  globalNotTyped = 34820,
  invalidDecart = 34821,
  invalidBoolean = 34822,
  invalidTypeOperation = 34823,
  invalidCard = 34824,
  invalidDebool = 34825,
  globalFuncMissing = 34826,
  globalFuncWithoutArgs = 34827,
  invalidReduce = 34832,
  invalidProjectionTuple = 34833,
  invalidProjectionSet = 34834,
  invalidEnumeration = 34835,
  invalidBinding = 34836,
  localOutOfScope = 34837,
  invalidElementPredicate = 34838,
  invalidEmptySetUsage = 34839,
  invalidArgsArity = 34840,
  invalidArgumentType = 34841,
  globalStructure = 34844,
  radicalUsage = 34849,
  invalidFilterArgumentType = 34850,
  invalidFilterArity = 34851,
  arithmeticNotSupported = 34852,
  typesNotCompatible = 34853,
  orderingNotSupported = 34854,

  globalNoValue = 34880,
  invalidPropertyUsage = 34881,
  globalMissingAST = 34882,
  globalFuncNoInterpretation = 34883,

  cstNonemptyBase = 34912,
  cstEmptyDerived = 34913,
  cstCallableNoArgs = 34914,
  cstNonCallableHasArgs = 34915,
  cstExpectedLogical = 34916,
  cstExpectedTyped = 34917
}

// ========= SCHEMAS ========
export const schemaConstituentaBasics = z.strictObject({
  id: z.coerce.number(),
  alias: z.string().nonempty(errorMsg.requiredField),
  convention: z.string(),
  cst_type: z.nativeEnum(CstType),
  definition_formal: z.string(),
  definition_raw: z.string(),
  definition_resolved: z.string(),
  term_raw: z.string(),
  term_resolved: z.string(),
  term_forms: z.array(z.strictObject({ text: z.string(), tags: z.string() }))
});

export const schemaConstituenta = schemaConstituentaBasics.extend({
  parse: z.strictObject({
    status: z.nativeEnum(ParsingStatus),
    valueClass: z.nativeEnum(ValueClass),
    typification: z.string(),
    syntaxTree: z.string(),
    args: z.array(z.strictObject({ alias: z.string(), typification: z.string() }))
  })
});

export const schemaRSForm = schemaLibraryItem.extend({
  editors: z.array(z.coerce.number()),

  version: z.coerce.number().optional(),
  versions: z.array(schemaVersionInfo),

  items: z.array(schemaConstituenta),
  inheritance: z.array(
    z.strictObject({
      child: z.coerce.number(),
      child_source: z.coerce.number(),
      parent: z.coerce.number(),
      parent_source: z.coerce.number()
    })
  ),
  oss: z.array(z.strictObject({ id: z.coerce.number(), alias: z.string() }))
});

export const schemaVersionCreatedResponse = z.strictObject({
  version: z.number(),
  schema: schemaRSForm
});

export const schemaCstCreate = schemaConstituentaBasics
  .pick({
    cst_type: true,
    alias: true,
    convention: true,
    definition_formal: true,
    definition_raw: true,
    term_raw: true,
    term_forms: true
  })
  .extend({
    insert_after: z.number().nullable()
  });

export const schemaCstCreatedResponse = z.strictObject({
  new_cst: schemaConstituentaBasics,
  schema: schemaRSForm
});

export const schemaCstUpdate = z.strictObject({
  target: z.number(),
  item_data: z.strictObject({
    convention: z.string().optional(),
    definition_formal: z.string().optional(),
    definition_raw: z.string().optional(),
    term_raw: z.string().optional(),
    term_forms: z.array(z.strictObject({ text: z.string(), tags: z.string() })).optional()
  })
});

export const schemaCstRename = z.strictObject({
  target: z.number(),
  alias: z.string(),
  cst_type: z.nativeEnum(CstType)
});

export const schemaProduceStructureResponse = z.strictObject({
  cst_list: z.array(z.number()),
  schema: schemaRSForm
});

export const schemaCstSubstitute = z.strictObject({
  original: z.number(),
  substitution: z.number()
});

export const schemaCstSubstitutions = z.strictObject({
  substitutions: z.array(schemaCstSubstitute).min(1, { message: errorMsg.emptySubstitutions })
});

export const schemaInlineSynthesis = z.strictObject({
  receiver: z.number(),
  source: z.number().nullable(),
  items: z.array(z.number()),
  substitutions: z.array(schemaCstSubstitute)
});

export const schemaRSErrorDescription = z.strictObject({
  errorType: z.nativeEnum(RSErrorType),
  position: z.number(),
  isCritical: z.boolean(),
  params: z.array(z.string())
});

export const schemaExpressionParse = z.strictObject({
  parseResult: z.boolean(),
  prefixLen: z.number(),
  syntax: z.nativeEnum(Syntax),
  typification: z.string(),
  valueClass: z.nativeEnum(ValueClass),
  errors: z.array(schemaRSErrorDescription),
  astText: z.string(),
  ast: z.array(
    z.strictObject({
      uid: z.number(),
      parent: z.number(),
      typeID: z.nativeEnum(TokenID),
      start: z.number(),
      finish: z.number(),
      data: z.strictObject({ dataType: z.string(), value: z.unknown().refine(value => value !== undefined) })
    })
  ),
  args: z.array(
    z.strictObject({
      alias: z.string(),
      typification: z.string()
    })
  )
});
