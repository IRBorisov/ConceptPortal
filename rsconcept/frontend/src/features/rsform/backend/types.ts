import { z } from 'zod';

import { schemaLibraryItem, schemaVersionInfo } from '@/features/library/backend/types';
import { RSErrorCode, TokenID, ValueClass } from '@/features/rslang';

import { limits } from '@/utils/constants';
import { errorMsg } from '@/utils/labels';

import { CstType } from '../models/rsform';

/** Represents Constituenta basic persistent data. */
export type ConstituentaBasicsDTO = z.infer<typeof schemaConstituentaBasics>;

/** Represents data for {@link RSForm} provided by backend. */
export type RSFormDTO = z.infer<typeof schemaRSForm>;

/** Represents data for {@link RSModel} provided by backend. */
export type RSModelDTO = z.infer<typeof schemaRSModel>;

/** Represents data for {@link Constituenta} provided by backend. */
export type ConstituentaValue = z.infer<typeof schemaConstituentaValue>;

/** Represents data for {@link Constituenta} provided to backend. */
export type ConstituentaDataDTO = z.infer<typeof schemaConstituentaData>;

/** Represents data, used for uploading {@link RSForm} as file. */
export interface RSFormUploadDTO {
  load_metadata: boolean;
  file: File;
}

/** Represents {@link Constituenta} data, used in creation process. */
export type CreateConstituentaDTO = z.infer<typeof schemaCreateConstituenta>;

/** Represents data response when creating {@link Constituenta}. */
export type ConstituentaCreatedResponse = z.infer<typeof schemaConstituentaCreatedResponse>;

/** Represents data, used in updating persistent attributes in {@link Constituenta}. */
export type UpdateConstituentaDTO = z.infer<typeof schemaUpdateConstituenta>;

/** Represents data, used in batch updating crucial attributes in {@link Constituenta}. */
export type UpdateCrucialDTO = z.infer<typeof schemaUpdateCrucial>;

/** Represents data, used in ordering a list of {@link Constituenta}. */
export interface MoveConstituentsDTO {
  items: number[];
  move_to: number; // Note: 0-base index
}

/** Represents data response when creating producing structure of {@link Constituenta}. */
export type ProduceStructureResponse = z.infer<typeof schemaProduceStructureResponse>;

/** Represents data, used in merging single {@link Constituenta}. */
export type CstSubstitute = z.infer<typeof schemaSubstituteConstituents>;

/** Represents input data for inline synthesis. */
export type InlineSynthesisDTO = z.infer<typeof schemaInlineSynthesis>;

/** Represents data, used in merging multiple {@link Constituenta}. */
export type SubstitutionsDTO = z.infer<typeof schemaSubstitutions>;

/** Represents data for creating or deleting an Attribution. */
export type Attribution = z.infer<typeof schemaAttribution>;

/** Represents data for clearing all attributions for a target constituenta. */
export type AttributionTargetDTO = z.infer<typeof schemaAttributionTarget>;

/** Represents Constituenta list. */
export interface ConstituentaList {
  items: number[];
}

/** Represents data response when creating {@link VersionInfo}. */
export type VersionCreatedResponse = z.infer<typeof schemaVersionCreatedResponse>;

// ========= SCHEMAS ========
export const schemaCstType = z.enum(Object.values(CstType) as [CstType, ...CstType[]]);
export const schemaValueClass = z.enum(Object.values(ValueClass) as [ValueClass, ...ValueClass[]]);
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

export const schemaAttribution = z.strictObject({
  container: z.number(),
  attribute: z.number()
});

export const schemaRSForm = schemaLibraryItem.extend({
  editors: z.array(z.number()),

  version: z.number().optional(),
  versions: z.array(schemaVersionInfo),

  items: z.array(schemaConstituentaBasics),
  attribution: z.array(schemaAttribution),
  inheritance: z.array(
    z.strictObject({
      child: z.number(),
      child_source: z.number(),
      parent: z.number(),
      parent_source: z.number()
    })
  ),
  oss: z.array(z.strictObject({ id: z.number(), alias: z.string() })),
  models: z.array(z.strictObject({ id: z.number(), alias: z.string() }))
});

type RecursiveArray = (number | RecursiveArray)[];
const RecursiveArraySchema: z.ZodType<RecursiveArray> = z.lazy(() =>
  z.array(
    z.union([
      z.number(),
      RecursiveArraySchema
    ])
  )
);

export const schemaConstituentaValue = z.strictObject({
  id: z.number(),
  type: z.string(),
  value: z.union([
    z.record(z.number(), z.string()),
    RecursiveArraySchema
  ])
});

export const schemaConstituentaData = z.strictObject({
  target: z.number(),
  type: z.string(),
  data: z.union([
    z.record(z.number(), z.string()),
    RecursiveArraySchema
  ])
});

export const schemaRSModel = schemaLibraryItem.extend({
  editors: z.array(z.number()),
  schema: schemaRSForm,
  items: z.array(schemaConstituentaValue)
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

