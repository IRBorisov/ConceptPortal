import { z } from 'zod';

import { schemaLibraryItem, schemaVersionInfo } from '@/features/library/backend/types';

import { limits } from '@/utils/constants';
import { errorMsg } from '@/utils/labels';

/** Represents {@link IConstituenta} type. */
export const CstType = {
  BASE: 'basic',
  STRUCTURED: 'structure',
  TERM: 'term',
  AXIOM: 'axiom',
  FUNCTION: 'function',
  PREDICATE: 'predicate',
  CONSTANT: 'constant',
  THEOREM: 'theorem'
} as const;
export type CstType = (typeof CstType)[keyof typeof CstType];

/** Represents syntax type. */
export const Syntax = {
  UNDEF: 'undefined',
  ASCII: 'ascii',
  MATH: 'math'
} as const;
export type Syntax = (typeof Syntax)[keyof typeof Syntax];

/** Represents computability class. */
export const ValueClass = {
  INVALID: 'invalid', // incalculable
  VALUE: 'value',
  PROPERTY: 'property'
} as const;
export type ValueClass = (typeof ValueClass)[keyof typeof ValueClass];

/** Represents parsing status. */
export const ParsingStatus = {
  UNDEF: 'undefined',
  VERIFIED: 'verified',
  INCORRECT: 'incorrect'
} as const;
export type ParsingStatus = (typeof ParsingStatus)[keyof typeof ParsingStatus];

/** Represents Constituenta basic persistent data. */
export type IConstituentaBasicsDTO = z.infer<typeof schemaConstituentaBasics>;

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
export type ICreateConstituentaDTO = z.infer<typeof schemaCreateConstituenta>;

/** Represents data response when creating {@link IConstituenta}. */
export type IConstituentaCreatedResponse = z.infer<typeof schemaConstituentaCreatedResponse>;

/** Represents data, used in updating persistent attributes in {@link IConstituenta}. */
export type IUpdateConstituentaDTO = z.infer<typeof schemaUpdateConstituenta>;

/** Represents data, used in ordering a list of {@link IConstituenta}. */
export interface IMoveConstituentsDTO {
  items: number[];
  move_to: number; // Note: 0-base index
}

/** Represents data response when creating producing structure of {@link IConstituenta}. */
export type IProduceStructureResponse = z.infer<typeof schemaProduceStructureResponse>;

/** Represents data, used in merging single {@link IConstituenta}. */
export type ISubstituteConstituents = z.infer<typeof schemaSubstituteConstituents>;

/** Represents input data for inline synthesis. */
export type IInlineSynthesisDTO = z.infer<typeof schemaInlineSynthesis>;

/** Represents {@link IConstituenta} data, used for checking expression. */
export interface ICheckConstituentaDTO {
  alias: string;
  cst_type: CstType;
  definition_formal: string;
}

/** Represents data, used in merging multiple {@link IConstituenta}. */
export type ISubstitutionsDTO = z.infer<typeof schemaSubstitutions>;

/** Represents Constituenta list. */
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
export const TokenID = {
  // Global, local IDs and literals
  ID_LOCAL: 258,
  ID_GLOBAL: 259,
  ID_FUNCTION: 260,
  ID_PREDICATE: 261,
  ID_RADICAL: 262,
  LIT_INTEGER: 263,
  LIT_WHOLE_NUMBERS: 264,
  LIT_EMPTYSET: 265,

  // Arithmetic
  PLUS: 266,
  MINUS: 267,
  MULTIPLY: 268,

  // Integer predicate symbols
  GREATER: 269,
  LESSER: 270,
  GREATER_OR_EQ: 271,
  LESSER_OR_EQ: 272,

  // Equality comparison
  EQUAL: 273,
  NOTEQUAL: 274,

  // Logic predicate symbols
  QUANTOR_UNIVERSAL: 275,
  QUANTOR_EXISTS: 276,
  LOGIC_NOT: 277,
  LOGIC_EQUIVALENT: 278,
  LOGIC_IMPLICATION: 279,
  LOGIC_OR: 280,
  LOGIC_AND: 281,

  // Set theory predicate symbols
  SET_IN: 282,
  SET_NOT_IN: 283,
  SUBSET: 284,
  SUBSET_OR_EQ: 285,
  NOT_SUBSET: 286,

  // Set theory operators
  DECART: 287,
  SET_UNION: 288,
  SET_INTERSECTION: 289,
  SET_MINUS: 290,
  SET_SYMMETRIC_MINUS: 291,
  BOOLEAN: 292,

  // Structure operations
  BIGPR: 293,
  SMALLPR: 294,
  FILTER: 295,
  CARD: 296,
  BOOL: 297,
  DEBOOL: 298,
  REDUCE: 299,

  // Term constructions prefixes
  DECLARATIVE: 300,
  RECURSIVE: 301,
  IMPERATIVE: 302,

  ITERATE: 303,
  ASSIGN: 304,

  // Punctuation
  PUNCTUATION_DEFINE: 305,
  PUNCTUATION_STRUCT: 306,
  PUNCTUATION_PL: 307,
  PUNCTUATION_PR: 308,
  PUNCTUATION_CL: 309,
  PUNCTUATION_CR: 310,
  PUNCTUATION_SL: 311,
  PUNCTUATION_SR: 312,
  PUNCTUATION_BAR: 313,
  PUNCTUATION_COMMA: 314,
  PUNCTUATION_SEMICOLON: 315,

  // ======= Non-terminal tokens =========
  NT_ENUM_DECL: 316,
  NT_TUPLE: 317,
  NT_ENUMERATION: 318,
  NT_TUPLE_DECL: 319,
  NT_ARG_DECL: 320,

  NT_FUNC_DEFINITION: 321,
  NT_ARGUMENTS: 322,
  NT_FUNC_CALL: 323,

  NT_DECLARATIVE_EXPR: 324,
  NT_IMPERATIVE_EXPR: 325,
  NT_RECURSIVE_FULL: 326,
  NT_RECURSIVE_SHORT: 327,

  // ======= Helper tokens ========
  INTERRUPT: 328,
  END: 329
} as const;
export type TokenID = (typeof TokenID)[keyof typeof TokenID];

/** Represents RSLang expression error types. */
export const RSErrorType = {
  unknownSymbol: 33283,
  syntax: 33792,
  missingParenthesis: 33798,
  missingCurlyBrace: 33799,
  invalidQuantifier: 33800,
  invalidImperative: 33801,
  expectedArgDeclaration: 33812,
  expectedLocal: 33813,
  localDoubleDeclare: 10241,
  localNotUsed: 10242,

  localUndeclared: 34817,
  localShadowing: 34818,

  typesNotEqual: 34819,
  globalNotTyped: 34820,
  invalidDecart: 34821,
  invalidBoolean: 34822,
  invalidTypeOperation: 34823,
  invalidCard: 34824,
  invalidDebool: 34825,
  globalFuncMissing: 34826,
  globalFuncWithoutArgs: 34827,
  invalidReduce: 34832,
  invalidProjectionTuple: 34833,
  invalidProjectionSet: 34834,
  invalidEnumeration: 34835,
  invalidBinding: 34836,
  localOutOfScope: 34837,
  invalidElementPredicate: 34838,
  invalidEmptySetUsage: 34839,
  invalidArgsArity: 34840,
  invalidArgumentType: 34841,
  globalStructure: 34844,
  radicalUsage: 34849,
  invalidFilterArgumentType: 34850,
  invalidFilterArity: 34851,
  arithmeticNotSupported: 34852,
  typesNotCompatible: 34853,
  orderingNotSupported: 34854,

  globalNoValue: 34880,
  invalidPropertyUsage: 34881,
  globalMissingAST: 34882,
  globalFuncNoInterpretation: 34883,

  cstNonemptyBase: 34912,
  cstEmptyDerived: 34913,
  cstCallableNoArgs: 34914,
  cstNonCallableHasArgs: 34915,
  cstExpectedLogical: 34916,
  cstExpectedTyped: 34917
} as const;
export type RSErrorType = (typeof RSErrorType)[keyof typeof RSErrorType];

// ========= SCHEMAS ========
export const schemaCstType = z.enum(Object.values(CstType) as [CstType, ...CstType[]]);
export const schemaSyntax = z.enum(Object.values(Syntax) as [Syntax, ...Syntax[]]);
export const schemaValueClass = z.enum(Object.values(ValueClass) as [ValueClass, ...ValueClass[]]);
export const schemaParsingStatus = z.enum(Object.values(ParsingStatus) as [ParsingStatus, ...ParsingStatus[]]);
export const schemaTokenID = z.enum(TokenID);
export const schemaRSErrorType = z.enum(RSErrorType);

export const schemaConstituentaBasics = z.strictObject({
  id: z.coerce.number(),
  alias: z.string().nonempty(errorMsg.requiredField),
  convention: z.string(),
  cst_type: schemaCstType,
  definition_formal: z.string(),
  definition_raw: z.string(),
  definition_resolved: z.string(),
  term_raw: z.string(),
  term_resolved: z.string(),
  term_forms: z.array(z.strictObject({ text: z.string(), tags: z.string() }))
});

export const schemaConstituenta = schemaConstituentaBasics.extend({
  parse: z.strictObject({
    status: schemaParsingStatus,
    valueClass: schemaValueClass,
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

export const schemaCreateConstituenta = schemaConstituentaBasics
  .pick({
    cst_type: true,
    term_forms: true
  })
  .extend({
    alias: z.string().max(limits.len_alias, errorMsg.aliasLength).nonempty(errorMsg.requiredField),
    convention: z.string().max(limits.len_description, errorMsg.descriptionLength),
    definition_formal: z.string().max(limits.len_description, errorMsg.descriptionLength),
    definition_raw: z.string().max(limits.len_description, errorMsg.descriptionLength),
    term_raw: z.string().max(limits.len_description, errorMsg.descriptionLength),
    insert_after: z.number().nullable()
  });

export const schemaConstituentaCreatedResponse = z.strictObject({
  new_cst: schemaConstituentaBasics,
  schema: schemaRSForm
});

export const schemaUpdateConstituenta = z.strictObject({
  target: z.number(),
  item_data: z.strictObject({
    alias: z.string().max(limits.len_alias, errorMsg.aliasLength).nonempty(errorMsg.requiredField).optional(),
    cst_type: schemaCstType.optional(),
    convention: z.string().max(limits.len_description, errorMsg.descriptionLength).optional(),
    definition_formal: z.string().max(limits.len_description, errorMsg.descriptionLength).optional(),
    definition_raw: z.string().max(limits.len_description, errorMsg.descriptionLength).optional(),
    term_raw: z.string().max(limits.len_description, errorMsg.descriptionLength).optional(),
    term_forms: z
      .array(
        z.strictObject({
          text: z.string().max(limits.len_description, errorMsg.descriptionLength),
          tags: z.string().max(limits.len_alias, errorMsg.aliasLength)
        })
      )
      .optional()
  })
});

export const schemaProduceStructureResponse = z.strictObject({
  cst_list: z.array(z.number()),
  schema: schemaRSForm
});

export const schemaSubstituteConstituents = z.strictObject({
  original: z.number(),
  substitution: z.number()
});

export const schemaSubstitutions = z.strictObject({
  substitutions: z.array(schemaSubstituteConstituents).min(1, { message: errorMsg.emptySubstitutions })
});

export const schemaInlineSynthesis = z.strictObject({
  receiver: z.number(),
  source: z.number().nullable(),
  items: z.array(z.number()),
  substitutions: z.array(schemaSubstituteConstituents)
});

export const schemaRSErrorDescription = z.strictObject({
  errorType: schemaRSErrorType,
  position: z.number(),
  isCritical: z.boolean(),
  params: z.array(z.string())
});

export const schemaExpressionParse = z.strictObject({
  parseResult: z.boolean(),
  prefixLen: z.number(),
  syntax: schemaSyntax,
  typification: z.string(),
  valueClass: schemaValueClass,
  errors: z.array(schemaRSErrorDescription),
  astText: z.string(),
  ast: z.array(
    z.strictObject({
      uid: z.number(),
      parent: z.number(),
      typeID: schemaTokenID,
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
