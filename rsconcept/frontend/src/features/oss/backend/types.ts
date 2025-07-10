import { z } from 'zod';

import { schemaLibraryItem } from '@/features/library/backend/types';
import { schemaSubstituteConstituents } from '@/features/rsform/backend/types';

import { errorMsg } from '@/utils/labels';

/** Represents {@link IOperation} type. */
export const OperationType = {
  INPUT: 'input',
  SYNTHESIS: 'synthesis'
} as const;
export type OperationType = (typeof OperationType)[keyof typeof OperationType];

/** Represents {@link ICstSubstitute} extended data. */
export type ICstSubstituteInfo = z.infer<typeof schemaCstSubstituteInfo>;

/** Represents {@link IOperation} data from server. */
export type IOperationDTO = z.infer<typeof schemaOperation>;

/** Represents {@link IBlock} data from server. */
export type IBlockDTO = z.infer<typeof schemaBlock>;

/** Represents backend data for {@link IOperationSchema}. */
export type IOperationSchemaDTO = z.infer<typeof schemaOperationSchema>;

/** Represents {@link IOperationSchema} layout. */
export type IOssLayout = z.infer<typeof schemaOssLayout>;

/** Represents {@link IBlock} data, used in Create action. */
export type ICreateBlockDTO = z.infer<typeof schemaCreateBlock>;

/** Represents data response when creating {@link IBlock}. */
export type IBlockCreatedResponse = z.infer<typeof schemaBlockCreatedResponse>;

/** Represents {@link IBlock} data, used in Update action. */
export type IUpdateBlockDTO = z.infer<typeof schemaUpdateBlock>;

/** Represents {@link IBlock} data, used in Delete action. */
export type IDeleteBlockDTO = z.infer<typeof schemaDeleteBlock>;

/** Represents data, used to move {@link IOssItem} to another parent. */
export type IMoveItemsDTO = z.infer<typeof schemaMoveItems>;

/** Represents {@link IOperation} data, used in Create action. */
export type ICreateSchemaDTO = z.infer<typeof schemaCreateSchema>;
export type ICreateSynthesisDTO = z.infer<typeof schemaCreateSynthesis>;
export type IImportSchemaDTO = z.infer<typeof schemaImportSchema>;

/** Represents data response when creating {@link IOperation}. */
export type IOperationCreatedResponse = z.infer<typeof schemaOperationCreatedResponse>;

/** Represents {@link IOperation} data, used in Update action. */
export type IUpdateOperationDTO = z.infer<typeof schemaUpdateOperation>;

/** Represents {@link IOperation} data, used in Delete action. */
export type IDeleteOperationDTO = z.infer<typeof schemaDeleteOperation>;

/** Represents target {@link IOperation}. */
export interface ITargetOperation {
  layout: IOssLayout;
  target: number;
}

/** Represents data response when creating {@link IRSForm} for Input {@link IOperation}. */
export type IInputCreatedResponse = z.infer<typeof schemaInputCreatedResponse>;

/** Represents {@link IOperation} data, used in setInput action. */
export type IUpdateInputDTO = z.infer<typeof schemaUpdateInput>;

/** Represents data, used relocating {@link IConstituenta}s between {@link ILibraryItem}s. */
export type IRelocateConstituentsDTO = z.infer<typeof schemaRelocateConstituents>;

/** Represents {@link IConstituenta} reference. */
export type IConstituentaReference = z.infer<typeof schemaConstituentaReference>;

/** Represents {@link IOperationSchema} node position. */
export type INodePosition = z.infer<typeof schemaNodePosition>;

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

export const schemaOperationData = schemaOperation.pick({
  alias: true,
  title: true,
  description: true,
  parent: true
});

export const schemaBlock = z.strictObject({
  id: z.number(),
  oss: z.number(),
  title: z.string(),
  description: z.string(),
  parent: z.number().nullable()
});

export const schemaPosition = z.strictObject({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number()
});

export const schemaCstSubstituteInfo = schemaSubstituteConstituents.extend({
  operation: z.number(),
  original_alias: z.string(),
  original_term: z.string(),
  substitution_alias: z.string(),
  substitution_term: z.string()
});

export const schemaNodePosition = schemaPosition.extend({
  nodeID: z.string()
});

export const schemaOssLayout = z.array(schemaNodePosition);

export const schemaOperationSchema = schemaLibraryItem.extend({
  editors: z.number().array(),
  operations: z.array(schemaOperation),
  blocks: z.array(schemaBlock),
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
  item_data: z.strictObject({
    title: z.string(),
    description: z.string(),
    parent: z.number().nullable()
  }),
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
  item_data: z.strictObject({
    title: z.string(),
    description: z.string(),
    parent: z.number().nullable()
  })
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
  position: z.strictObject({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number()
  }),
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
  item_data: z.strictObject({
    alias: z.string().nonempty(errorMsg.requiredField),
    title: z.string(),
    description: z.string(),
    parent: z.number().nullable()
  }),
  arguments: z.array(z.number()),
  substitutions: z.array(schemaSubstituteConstituents)
});

export const schemaDeleteOperation = z.strictObject({
  target: z.number(),
  layout: schemaOssLayout,
  keep_constituents: z.boolean(),
  delete_schema: z.boolean()
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
