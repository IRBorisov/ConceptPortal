import { z } from 'zod';

import { ILibraryItem, ILibraryItemData } from '@/features/library/models/library';
import { schemaCstSubstitute } from '@/features/rsform/backend/types';

import { IArgument, ICstSubstituteEx, IOperation, OperationType } from '../models/oss';

/**
 * Represents {@link IOperation} data from server.
 */
export interface IOperationDTO extends Omit<IOperation, 'substitutions' | 'arguments'> {}

/**
 * Represents backend data for {@link IOperationSchema}.
 */
export interface IOperationSchemaDTO extends ILibraryItemData {
  items: IOperationDTO[];
  arguments: IArgument[];
  substitutions: ICstSubstituteEx[];
}

/**
 * Represents {@link IOperation} position.
 */
export const schemaOperationPosition = z.object({
  id: z.number(),
  position_x: z.number(),
  position_y: z.number()
});

/**
 * Represents {@link IOperation} position.
 */
export type IOperationPosition = z.infer<typeof schemaOperationPosition>;

/**
 * Represents {@link IOperation} data, used in creation process.
 */
export const schemaOperationCreate = z.object({
  positions: z.array(schemaOperationPosition),
  item_data: z.object({
    alias: z.string().nonempty(),
    operation_type: z.nativeEnum(OperationType),
    title: z.string(),
    comment: z.string(),
    position_x: z.number(),
    position_y: z.number(),
    result: z.number().nullable()
  }),
  arguments: z.array(z.number()),
  create_schema: z.boolean()
});

/**
 * Represents {@link IOperation} data, used in creation process.
 */
export type IOperationCreateDTO = z.infer<typeof schemaOperationCreate>;

/**
 * Represents data response when creating {@link IOperation}.
 */
export interface IOperationCreatedResponse {
  new_operation: IOperationDTO;
  oss: IOperationSchemaDTO;
}

/**
 * Represents target {@link IOperation}.
 */
export interface ITargetOperation {
  positions: IOperationPosition[];
  target: number;
}

/**
 * Represents {@link IOperation} data, used in destruction process.
 */
export const schemaOperationDelete = z.object({
  target: z.number(),
  positions: z.array(schemaOperationPosition),
  keep_constituents: z.boolean(),
  delete_schema: z.boolean()
});

/**
 * Represents {@link IOperation} data, used in destruction process.
 */
export type IOperationDeleteDTO = z.infer<typeof schemaOperationDelete>;

/**
 * Represents data response when creating {@link IRSForm} for Input {@link IOperation}.
 */
export interface IInputCreatedResponse {
  new_schema: ILibraryItem;
  oss: IOperationSchemaDTO;
}

/**
 * Represents {@link IOperation} data, used in setInput process.
 */
export const schemaInputUpdate = z.object({
  target: z.number(),
  positions: z.array(schemaOperationPosition),
  input: z.number().nullable()
});

/**
 * Represents {@link IOperation} data, used in setInput process.
 */
export type IInputUpdateDTO = z.infer<typeof schemaInputUpdate>;

/**
 * Represents {@link IOperation} data, used in update process.
 */
export const schemaOperationUpdate = z.object({
  target: z.number(),
  positions: z.array(schemaOperationPosition),
  item_data: z.object({
    alias: z.string().nonempty(),
    title: z.string(),
    comment: z.string()
  }),
  arguments: z.array(z.number()),
  substitutions: z.array(schemaCstSubstitute)
});

/**
 * Represents {@link IOperation} data, used in update process.
 */
export type IOperationUpdateDTO = z.infer<typeof schemaOperationUpdate>;

/**
 * Represents data, used relocating {@link IConstituenta}s between {@link ILibraryItem}s.
 */
export const schemaCstRelocate = z.object({
  destination: z.number(),
  items: z.array(z.number()).refine(data => data.length > 0)
});

/**
 * Represents data, used relocating {@link IConstituenta}s between {@link ILibraryItem}s.
 */
export type ICstRelocateDTO = z.infer<typeof schemaCstRelocate>;
