import { z } from 'zod';

import { AccessPolicy, LibraryItemType, schemaVersionInfo } from '@/features/library/models/library';

import { errorMsg } from '@/utils/labels';

import { CstType } from '../models/rsform';
import { ParsingStatus, RSErrorType, Syntax, TokenID, ValueClass } from '../models/rslang';

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

/** Represents target {@link IConstituenta}. */
export interface ITargetCst {
  target: number;
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

/** Represents parsing error description. */
export type IRSErrorDescription = z.infer<typeof schemaRSErrorDescription>;

/** Represents results of expression parse in RSLang. */
export type IExpressionParseDTO = z.infer<typeof schemaExpressionParse>;

// ========= SCHEMAS ========
export const schemaConstituentaBasics = z.object({
  id: z.coerce.number(),
  alias: z.string().nonempty(errorMsg.requiredField),
  convention: z.string(),
  cst_type: z.nativeEnum(CstType),
  definition_formal: z.string(),
  definition_raw: z.string(),
  definition_resolved: z.string(),
  term_raw: z.string(),
  term_resolved: z.string(),
  term_forms: z.array(z.object({ text: z.string(), tags: z.string() }))
});

export const schemaConstituenta = schemaConstituentaBasics.extend({
  parse: z.object({
    status: z.nativeEnum(ParsingStatus),
    valueClass: z.nativeEnum(ValueClass),
    typification: z.string(),
    syntaxTree: z.string(),
    args: z.array(z.object({ alias: z.string(), typification: z.string() }))
  })
});

export const schemaRSForm = z.object({
  id: z.coerce.number(),
  item_type: z.nativeEnum(LibraryItemType),
  title: z.string(),
  alias: z.string(),
  comment: z.string(),
  visible: z.boolean(),
  read_only: z.boolean(),
  location: z.string(),
  access_policy: z.nativeEnum(AccessPolicy),
  time_create: z.string(),
  time_update: z.string(),

  owner: z.coerce.number().nullable(),
  editors: z.array(z.coerce.number()),

  version: z.coerce.number().optional(),
  versions: z.array(schemaVersionInfo),

  items: z.array(schemaConstituenta),
  inheritance: z.array(
    z.object({
      child: z.coerce.number(),
      child_source: z.coerce.number(),
      parent: z.coerce.number(),
      parent_source: z.coerce.number()
    })
  ),
  oss: z.array(z.object({ id: z.coerce.number(), alias: z.string() }))
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

export const schemaCstCreatedResponse = z.object({
  new_cst: schemaConstituentaBasics,
  schema: schemaRSForm
});

export const schemaCstUpdate = z.object({
  target: z.number(),
  item_data: z.object({
    convention: z.string().optional(),
    definition_formal: z.string().optional(),
    definition_raw: z.string().optional(),
    term_raw: z.string().optional(),
    term_forms: z.array(z.object({ text: z.string(), tags: z.string() })).optional()
  })
});

export const schemaCstRename = z.object({
  target: z.number(),
  alias: z.string(),
  cst_type: z.nativeEnum(CstType)
});

export const schemaProduceStructureResponse = z.object({
  cst_list: z.array(z.number()),
  schema: schemaRSForm
});

export const schemaCstSubstitute = z.object({
  original: z.number(),
  substitution: z.number()
});

export const schemaCstSubstitutions = z.object({
  substitutions: z.array(schemaCstSubstitute).min(1, { message: errorMsg.emptySubstitutions })
});

export const schemaInlineSynthesis = z.object({
  receiver: z.number(),
  source: z.number().nullable(),
  items: z.array(z.number()),
  substitutions: z.array(schemaCstSubstitute)
});

export const schemaRSErrorDescription = z.object({
  errorType: z.nativeEnum(RSErrorType),
  position: z.number(),
  isCritical: z.boolean(),
  params: z.array(z.string())
});

export const schemaExpressionParse = z.object({
  parseResult: z.boolean(),
  prefixLen: z.number(),
  syntax: z.nativeEnum(Syntax),
  typification: z.string(),
  valueClass: z.nativeEnum(ValueClass),
  errors: z.array(schemaRSErrorDescription),
  astText: z.string(),
  ast: z.array(
    z.object({
      uid: z.number(),
      parent: z.number(),
      typeID: z.nativeEnum(TokenID),
      start: z.number(),
      finish: z.number(),
      data: z.object({ dataType: z.string(), value: z.unknown().refine(value => value !== undefined) })
    })
  ),
  args: z.array(
    z.object({
      alias: z.string(),
      typification: z.string()
    })
  )
});
