/**
 * Endpoints: oss.
 */

import {
  ICstRelocateData,
  IInputCreatedResponse,
  IOperationCreateData,
  IOperationCreatedResponse,
  IOperationDeleteData,
  IOperationSchemaData,
  IOperationSetInputData,
  IOperationUpdateData,
  IPositionsData,
  ITargetOperation
} from '@/models/oss';
import { IConstituentaReference, ITargetCst } from '@/models/rsform';

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

export function patchDeleteOperation(oss: string, request: FrontExchange<IOperationDeleteData, IOperationSchemaData>) {
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

export function patchSetInput(oss: string, request: FrontExchange<IOperationSetInputData, IOperationSchemaData>) {
  AxiosPatch({
    endpoint: `/api/oss/${oss}/set-input`,
    request: request
  });
}

export function patchUpdateOperation(oss: string, request: FrontExchange<IOperationUpdateData, IOperationSchemaData>) {
  AxiosPatch({
    endpoint: `/api/oss/${oss}/update-operation`,
    request: request
  });
}

export function postExecuteOperation(oss: string, request: FrontExchange<ITargetOperation, IOperationSchemaData>) {
  AxiosPost({
    endpoint: `/api/oss/${oss}/execute-operation`,
    request: request
  });
}

export function postRelocateConstituents(request: FrontPush<ICstRelocateData>) {
  AxiosPost({
    endpoint: `/api/oss/relocate-constituents`,
    request: request
  });
}

export function postFindPredecessor(request: FrontExchange<ITargetCst, IConstituentaReference>) {
  AxiosPost({
    endpoint: `/api/oss/get-predecessor`,
    request: request
  });
}
