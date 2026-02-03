import { z } from 'zod';

import { schemaLibraryItem, schemaVersionInfo } from '@/features/library/backend/types';
import { RSErrorCode, ValueClass } from '@/features/rslang';
import { TokenID } from '@/features/rslang/parser/token';

import { limits } from '@/utils/constants';
import { errorMsg } from '@/utils/labels';

import { CstType } from '../models/rsform';

/** Represents syntax type. */
export const Syntax = {
  UNDEF: 'undefined',
  ASCII: 'ascii',
  MATH: 'math'
} as const;
export type Syntax = (typeof Syntax)[keyof typeof Syntax];

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
  load_metadata: boolean;
  file: File;
}

/** Represents {@link IConstituenta} data, used in creation process. */
export type ICreateConstituentaDTO = z.infer<typeof schemaCreateConstituenta>;

/** Represents data response when creating {@link IConstituenta}. */
export type IConstituentaCreatedResponse = z.infer<typeof schemaConstituentaCreatedResponse>;

/** Represents data, used in updating persistent attributes in {@link IConstituenta}. */
export type IUpdateConstituentaDTO = z.infer<typeof schemaUpdateConstituenta>;

/** Represents data, used in batch updating crucial attributes in {@link IConstituenta}. */
export type IUpdateCrucialDTO = z.infer<typeof schemaUpdateCrucial>;

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

/** Represents data for creating or deleting an Attribution. */
export type IAttribution = z.infer<typeof schemaAttribution>;

/** Represents data for clearing all attributions for a target constituenta. */
export type IAttributionTargetDTO = z.infer<typeof schemaAttributionTarget>;

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

// ========= SCHEMAS ========
export const schemaCstType = z.enum(Object.values(CstType) as [CstType, ...CstType[]]);
export const schemaSyntax = z.enum(Object.values(Syntax) as [Syntax, ...Syntax[]]);
export const schemaValueClass = z.enum(Object.values(ValueClass) as [ValueClass, ...ValueClass[]]);
export const schemaParsingStatus = z.enum(Object.values(ParsingStatus) as [ParsingStatus, ...ParsingStatus[]]);
export const schemaTokenID = z.enum(TokenID);
export const schemaRSErrorType = z.enum(RSErrorCode);

export const schemaConstituentaBasics = z.strictObject({
  id: z.number(),
  alias: z.string().nonempty(errorMsg.requiredField),
  convention: z.string(),
  crucial: z.boolean(),
  cst_type: schemaCstType,
  definition_formal: z.string(),
  definition_raw: z.string(),
  definition_resolved: z.string(),
  term_raw: z.string(),
  term_resolved: z.string(),
  term_forms: z.array(z.strictObject({ text: z.string(), tags: z.string() }))
});

export const schemaConstituenta = schemaConstituentaBasics.extend({
  parse: z
    .strictObject({
      status: schemaParsingStatus,
      valueClass: schemaValueClass,
      typification: z.string(),
      syntaxTree: z.string(),
      args: z.array(z.strictObject({ alias: z.string(), typification: z.string() }))
    })
    .optional()
});

export const schemaAttribution = z.strictObject({
  container: z.number(),
  attribute: z.number()
});

export const schemaRSForm = schemaLibraryItem.extend({
  editors: z.array(z.number()),

  version: z.number().optional(),
  versions: z.array(schemaVersionInfo),

  items: z.array(schemaConstituenta),
  attribution: z.array(schemaAttribution),
  inheritance: z.array(
    z.strictObject({
      child: z.number(),
      child_source: z.number(),
      parent: z.number(),
      parent_source: z.number()
    })
  ),
  oss: z.array(z.strictObject({ id: z.number(), alias: z.string() }))
});

export const schemaVersionCreatedResponse = z.strictObject({
  version: z.number(),
  schema: schemaRSForm
});

export const schemaCreateConstituenta = schemaConstituentaBasics
  .pick({
    cst_type: true,
    term_forms: true,
    crucial: true
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
    crucial: z.boolean().optional(),
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

export const schemaUpdateCrucial = z.strictObject({
  target: z.array(z.number()),
  value: z.boolean()
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

export const schemaAttributionTarget = z.strictObject({
  target: z.number()
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
      typeID: z.number(),
      from: z.number(),
      to: z.number(),
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
