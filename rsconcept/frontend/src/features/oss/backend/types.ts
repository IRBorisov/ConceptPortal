import { z } from 'zod';

import { schemaLibraryItem } from '@/features/library/backend/types';
import { schemaCstSubstitute } from '@/features/rsform/backend/types';

import { errorMsg } from '@/utils/labels';

/**
 * Represents {@link IOperation} type.
 */
export const OperationType = {
  INPUT: 'input',
  SYNTHESIS: 'synthesis'
} as const;
export type OperationType = (typeof OperationType)[keyof typeof OperationType];

/** Represents {@link ICstSubstitute} extended data. */
export type ICstSubstituteInfo = z.infer<typeof schemaCstSubstituteInfo>;

/** Represents {@link IOperation} data from server. */
export type IOperationDTO = z.infer<typeof schemaOperation>;

/** Represents backend data for {@link IOperationSchema}. */
export type IOperationSchemaDTO = z.infer<typeof schemaOperationSchema>;

/** Represents {@link IOperation} position. */
export type IOperationPosition = z.infer<typeof schemaOperationPosition>;

/** Represents {@link IOperation} data, used in creation process. */
export type IOperationCreateDTO = z.infer<typeof schemaOperationCreate>;

/** Represents data response when creating {@link IOperation}. */
export type IOperationCreatedResponse = z.infer<typeof schemaOperationCreatedResponse>;
/**
 * Represents target {@link IOperation}.
 */
export interface ITargetOperation {
  positions: IOperationPosition[];
  target: number;
}

/** Represents {@link IOperation} data, used in destruction process. */
export type IOperationDeleteDTO = z.infer<typeof schemaOperationDelete>;

/** Represents data response when creating {@link IRSForm} for Input {@link IOperation}. */
export type IInputCreatedResponse = z.infer<typeof schemaInputCreatedResponse>;

/** Represents {@link IOperation} data, used in setInput process. */
export type IInputUpdateDTO = z.infer<typeof schemaInputUpdate>;

/** Represents {@link IOperation} data, used in update process. */
export type IOperationUpdateDTO = z.infer<typeof schemaOperationUpdate>;

/** Represents data, used relocating {@link IConstituenta}s between {@link ILibraryItem}s. */
export type ICstRelocateDTO = z.infer<typeof schemaCstRelocate>;

/** Represents {@link IConstituenta} reference. */
export type IConstituentaReference = z.infer<typeof schemaConstituentaReference>;

// ====== Schemas ======
export const schemaOperationType = z.enum(Object.values(OperationType) as [OperationType, ...OperationType[]]);

export const schemaOperation = z.strictObject({
  id: z.number(),
  operation_type: schemaOperationType,
  oss: z.number(),

  alias: z.string(),
  title: z.string(),
  description: z.string(),

  position_x: z.number(),
  position_y: z.number(),

  result: z.number().nullable()
});

export const schemaCstSubstituteInfo = schemaCstSubstitute.extend({
  operation: z.number(),
  original_alias: z.string(),
  original_term: z.string(),
  substitution_alias: z.string(),
  substitution_term: z.string()
});

export const schemaOperationSchema = schemaLibraryItem.extend({
  editors: z.number().array(),
  items: z.array(schemaOperation),
  arguments: z
    .object({
      operation: z.number(),
      argument: z.number()
    })
    .array(),
  substitutions: z.array(schemaCstSubstituteInfo)
});

export const schemaOperationPosition = z.strictObject({
  id: z.number(),
  position_x: z.number(),
  position_y: z.number()
});

export const schemaOperationCreate = z.strictObject({
  positions: z.array(schemaOperationPosition),
  item_data: z.strictObject({
    alias: z.string().nonempty(),
    operation_type: schemaOperationType,
    title: z.string(),
    description: z.string(),
    position_x: z.number(),
    position_y: z.number(),
    result: z.number().nullable()
  }),
  arguments: z.array(z.number()),
  create_schema: z.boolean()
});

export const schemaOperationCreatedResponse = z.strictObject({
  new_operation: schemaOperation,
  oss: schemaOperationSchema
});

export const schemaOperationDelete = z.strictObject({
  target: z.number(),
  positions: z.array(schemaOperationPosition),
  keep_constituents: z.boolean(),
  delete_schema: z.boolean()
});

export const schemaInputUpdate = z.strictObject({
  target: z.number(),
  positions: z.array(schemaOperationPosition),
  input: z.number().nullable()
});

export const schemaInputCreatedResponse = z.strictObject({
  new_schema: schemaLibraryItem,
  oss: schemaOperationSchema
});

export const schemaOperationUpdate = z.strictObject({
  target: z.number(),
  positions: z.array(schemaOperationPosition),
  item_data: z.strictObject({
    alias: z.string().nonempty(errorMsg.requiredField),
    title: z.string(),
    description: z.string()
  }),
  arguments: z.array(z.number()),
  substitutions: z.array(schemaCstSubstitute)
});

export const schemaCstRelocate = z.strictObject({
  destination: z.number().nullable(),
  items: z.array(z.number()).refine(data => data.length > 0)
});

export const schemaConstituentaReference = z.strictObject({
  id: z.number(),
  schema: z.number()
});
