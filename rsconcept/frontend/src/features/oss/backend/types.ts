import { z } from 'zod';

import { schemaLibraryItem } from '@/features/library/backend/types';
import { schemaSubstituteConstituents } from '@/features/rsform/backend/types';

import { limits } from '@/utils/constants';
import { errorMsg } from '@/utils/labels';

/** Represents {@link Operation} type. */
export const OperationType = {
  INPUT: 'input',
  SYNTHESIS: 'synthesis',
  REPLICA: 'replica'
} as const;
export type OperationType = (typeof OperationType)[keyof typeof OperationType];

/** Represents {@link CstSubstitute} extended data. */
export type CstSubstituteInfo = z.infer<typeof schemaCstSubstituteInfo>;

/** Represents {@link Operation} data from server. */
export type OperationDTO = z.infer<typeof schemaOperation>;

/** Represents {@link Block} data from server. */
export type BlockDTO = z.infer<typeof schemaBlock>;

/** Represents backend data for {@link OperationSchema}. */
export type OperationSchemaDTO = z.infer<typeof schemaOperationSchema>;

/** Represents {@link OperationSchema} layout. */
export type OssLayout = z.infer<typeof schemaOssLayout>;

/** Represents {@link OperationSchema} layout for data transfer. */
export type IOssLayoutDTO = z.infer<typeof schemaOssLayoutData>;

/** Represents {@link Block} data, used in Create action. */
export type CreateBlockDTO = z.infer<typeof schemaCreateBlock>;

/** Represents data response when creating {@link Block}. */
export type BlockCreatedResponse = z.infer<typeof schemaBlockCreatedResponse>;

/** Represents {@link Block} data, used in Update action. */
export type UpdateBlockDTO = z.infer<typeof schemaUpdateBlock>;

/** Represents {@link Block} data, used in Delete action. */
export type DeleteBlockDTO = z.infer<typeof schemaDeleteBlock>;

/** Represents data, used to move {@link OssItem} to another parent. */
export type MoveItemsDTO = z.infer<typeof schemaMoveItems>;

/** Represents {@link Operation} data, used in Create action. */
export type CreateSchemaDTO = z.infer<typeof schemaCreateSchema>;
export type CreateReplicaDTO = z.infer<typeof schemaCreateReplica>;
export type CreateSynthesisDTO = z.infer<typeof schemaCreateSynthesis>;
export type ImportSchemaDTO = z.infer<typeof schemaImportSchema>;
export type CloneSchemaDTO = z.infer<typeof schemaCloneSchema>;

/** Represents data response when creating {@link Operation}. */
export type OperationCreatedResponse = z.infer<typeof schemaOperationCreatedResponse>;

/** Represents {@link Operation} data, used in Update action. */
export type UpdateOperationDTO = z.infer<typeof schemaUpdateOperation>;

/** Represents {@link Operation} data, used in Delete action. */
export type DeleteOperationDTO = z.infer<typeof schemaDeleteOperation>;

/** Represents {@link Operation} reference type data, used in Delete action. */
export type DeleteReplicaDTO = z.infer<typeof schemaDeleteReplica>;

/** Represents target {@link Operation}. */
export interface TargetOperation {
  layout: OssLayout;
  target: number;
}

/** Represents data response when creating {@link RSForm} for Input {@link Operation}. */
export type InputCreatedResponse = z.infer<typeof schemaInputCreatedResponse>;

/** Represents {@link Operation} data, used in setInput action. */
export type UpdateInputDTO = z.infer<typeof schemaUpdateInput>;

/** Represents data, used relocating {@link Constituenta}s between {@link LibraryItem}s. */
export type RelocateConstituentsDTO = z.infer<typeof schemaRelocateConstituents>;

/** Represents {@link Constituenta} reference. */
export type ConstituentaReference = z.infer<typeof schemaConstituentaReference>;

/** Represents {@link OperationSchema} node position. */
export type NodePosition = z.infer<typeof schemaNodePosition>;

// ====== Schemas ======
export const schemaOperationType = z.enum(Object.values(OperationType) as [OperationType, ...OperationType[]]);

export const schemaOperation = z.strictObject({
  id: z.number(),
  operation_type: schemaOperationType,
  oss: z.number(),
  alias: z.string(),
  title: z.string(),
  description: z.string(),
  parent: z.number().nullable(),
  is_import: z.boolean(),
  result: z.number().nullable()
});

const schemaOperationData = schemaOperation
  .pick({
    parent: true
  })
  .extend({
    alias: z.string().max(limits.len_alias, errorMsg.aliasLength).nonempty(errorMsg.requiredField),
    title: z.string().max(limits.len_title, errorMsg.titleLength),
    description: z.string().max(limits.len_description, errorMsg.descriptionLength)
  });

const schemaBlockData = schemaOperationData.omit({ alias: true }).extend({
  title: z.string().max(limits.len_alias, errorMsg.aliasLength).nonempty(errorMsg.requiredField)
});

export const schemaBlock = z.strictObject({
  id: z.number(),
  oss: z.number(),
  title: z.string(),
  description: z.string(),
  parent: z.number().nullable()
});

const schemaReplica = z.strictObject({
  original: z.number(),
  replica: z.number()
});

export const schemaPosition = z.strictObject({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number()
});

export const schemaCstSubstituteInfo = schemaSubstituteConstituents.extend({
  operation: z.number(),
  original_schema: z.number(),
  original_alias: z.string(),
  original_term: z.string(),
  substitution_schema: z.number(),
  substitution_alias: z.string(),
  substitution_term: z.string()
});

export const schemaNodePosition = schemaPosition.extend({
  nodeID: z.string()
});

export const schemaOssLayout = z.array(schemaNodePosition);

export const schemaOssLayoutData = z.strictObject({
  data: schemaOssLayout
});

export const schemaOperationSchema = schemaLibraryItem.extend({
  editors: z.number().array(),
  operations: z.array(schemaOperation),
  blocks: z.array(schemaBlock),
  replicas: z.array(schemaReplica),
  layout: schemaOssLayout,
  arguments: z
    .object({
      operation: z.number(),
      argument: z.number()
    })
    .array(),
  substitutions: z.array(schemaCstSubstituteInfo)
});

export const schemaCreateBlock = z.strictObject({
  layout: schemaOssLayout,
  item_data: schemaBlockData,
  position: schemaPosition,
  children_operations: z.array(z.number()),
  children_blocks: z.array(z.number())
});

export const schemaBlockCreatedResponse = z.strictObject({
  new_block: z.number(),
  oss: schemaOperationSchema
});

export const schemaUpdateBlock = z.strictObject({
  target: z.number(),
  layout: schemaOssLayout,
  item_data: schemaBlockData
});

export const schemaDeleteBlock = z.strictObject({
  target: z.number(),
  layout: schemaOssLayout
});

export const schemaCreateSchema = z.strictObject({
  layout: schemaOssLayout,
  item_data: schemaOperationData,
  position: schemaPosition
});

export const schemaCreateReplica = z.strictObject({
  target: z.number(),
  layout: schemaOssLayout,
  position: schemaPosition
});

export const schemaCloneSchema = z.strictObject({
  layout: schemaOssLayout,
  source_operation: z.number(),
  position: schemaPosition
});

export const schemaCreateSynthesis = z.strictObject({
  layout: schemaOssLayout,
  item_data: schemaOperationData,
  position: schemaPosition,
  arguments: z.array(z.number()),
  substitutions: z.array(schemaSubstituteConstituents)
});

export const schemaImportSchema = z.strictObject({
  layout: schemaOssLayout,
  item_data: schemaOperationData,
  position: schemaPosition,
  source: z.number(),
  clone_source: z.boolean()
});

export const schemaOperationCreatedResponse = z.strictObject({
  new_operation: z.number(),
  oss: schemaOperationSchema
});

export const schemaUpdateOperation = z.strictObject({
  target: z.number(),
  layout: schemaOssLayout,
  item_data: schemaOperationData,
  arguments: z.array(z.number()),
  substitutions: z.array(schemaSubstituteConstituents)
});

export const schemaDeleteOperation = z.strictObject({
  target: z.number(),
  layout: schemaOssLayout,
  keep_constituents: z.boolean(),
  delete_schema: z.boolean()
});

export const schemaDeleteReplica = z.strictObject({
  target: z.number(),
  layout: schemaOssLayout,
  keep_constituents: z.boolean(),
  keep_connections: z.boolean()
});

export const schemaMoveItems = z.strictObject({
  layout: schemaOssLayout,
  operations: z.array(z.number()),
  blocks: z.array(z.number()),
  destination: z.number().nullable()
});

export const schemaUpdateInput = z.strictObject({
  target: z.number(),
  layout: schemaOssLayout,
  input: z.number().nullable()
});

export const schemaInputCreatedResponse = z.strictObject({
  new_schema: schemaLibraryItem,
  oss: schemaOperationSchema
});

export const schemaRelocateConstituents = z.strictObject({
  destination: z.number().nullable(),
  items: z.array(z.number()).refine(data => data.length > 0)
});

export const schemaConstituentaReference = z.strictObject({
  id: z.number(),
  schema: z.number()
});
