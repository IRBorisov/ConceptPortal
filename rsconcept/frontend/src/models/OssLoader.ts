/**
 * Module: OSS data loading and processing.
 */

import { IOperationSchema, IOperationSchemaData } from './oss';

/**
 * Loads data into an {@link IOperationSchema} based on {@link IOperationSchemaData}.
 *
 */
export class OssLoader {
  private schema: IOperationSchemaData;


  constructor(input: IOperationSchemaData) {
    this.schema = input;
  }

  produceOSS(): IOperationSchema {
    const result = this.schema as IOperationSchema;
    //result.producedData = [1, 2, 3]; // TODO: put data processing here
    return result;
  }
}
