/**
 * Endpoints: oss.
 */

import {
  IOperationCreateData,
  IOperationCreatedResponse,
  IOperationSchemaData,
  IPositionsData,
  ITargetOperation
} from '@/models/oss';

import { AxiosGet, AxiosPatch, AxiosPost, FrontExchange, FrontPull, FrontPush } from './apiTransport';

export function getOssDetails(target: string, request: FrontPull<IOperationSchemaData>) {
  AxiosGet({
    endpoint: `/api/oss/${target}/details`,
    request: request
  });
}

export function patchUpdatePositions(schema: string, request: FrontPush<IPositionsData>) {
  AxiosPatch({
    endpoint: `/api/oss/${schema}/update-positions`,
    request: request
  });
}

export function postCreateOperation(
  schema: string,
  request: FrontExchange<IOperationCreateData, IOperationCreatedResponse>
) {
  AxiosPost({
    endpoint: `/api/oss/${schema}/create-operation`,
    request: request
  });
}

export function patchDeleteOperation(schema: string, request: FrontExchange<ITargetOperation, IOperationSchemaData>) {
  AxiosPatch({
    endpoint: `/api/oss/${schema}/delete-operation`,
    request: request
  });
}
