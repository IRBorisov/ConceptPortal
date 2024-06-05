/**
 * Module: Schema of Synthesis Operations.
 */

import { ILibraryItemData } from './library';

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
  producedData: number[]; // TODO: modify this to store calculated state on load
}
