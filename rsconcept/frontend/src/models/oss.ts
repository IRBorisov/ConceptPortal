/**
 * Module: Schema of Synthesis Operations.
 */

import { ILibraryItemData } from './library';
import { UserID } from './user';

/**
 * Represents backend data for Schema of Synthesis Operations.
 */
export interface IOperationSchemaData extends ILibraryItemData {
  additional_data?: number[];
}

/**
 * Represents Schema of Synthesis Operations.
 */
export interface IOperationSchema extends IOperationSchemaData {
  subscribers: UserID[];
  editors: UserID[];

  producedData: number[]; // TODO: modify this to store calculated state on load
}
