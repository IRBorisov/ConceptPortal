/**
 * Endpoints: oss.
 */

import {
  IInputCreatedResponse,
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

export function patchUpdatePositions(oss: string, request: FrontPush<IPositionsData>) {
  AxiosPatch({
    endpoint: `/api/oss/${oss}/update-positions`,
    request: request
  });
}

export function postCreateOperation(
  oss: string,
  request: FrontExchange<IOperationCreateData, IOperationCreatedResponse>
) {
  AxiosPost({
    endpoint: `/api/oss/${oss}/create-operation`,
    request: request
  });
}

export function patchDeleteOperation(oss: string, request: FrontExchange<ITargetOperation, IOperationSchemaData>) {
  AxiosPatch({
    endpoint: `/api/oss/${oss}/delete-operation`,
    request: request
  });
}

export function patchCreateInput(oss: string, request: FrontExchange<ITargetOperation, IInputCreatedResponse>) {
  AxiosPatch({
    endpoint: `/api/oss/${oss}/create-input`,
    request: request
  });
}
