/**
 * Endpoints: rsforms.
 */

import { ILibraryCreateData, ILibraryItem } from '@/models/library';
import { ICstSubstituteData } from '@/models/oss';
import {
  ICheckConstituentaData,
  IConstituentaList,
  IConstituentaMeta,
  ICstCreateData,
  ICstCreatedResponse,
  ICstMovetoData,
  ICstRenameData,
  ICstUpdateData,
  IInlineSynthesisData,
  IProduceStructureResponse,
  IRSFormData,
  IRSFormUploadData,
  ITargetCst
} from '@/models/rsform';
import { IExpressionParse } from '@/models/rslang';

import { AxiosGet, AxiosPatch, AxiosPost, FrontExchange, FrontPull } from './apiTransport';

export function postRSFormFromFile(request: FrontExchange<ILibraryCreateData, ILibraryItem>) {
  AxiosPost({
    endpoint: '/api/rsforms/create-detailed',
    request: request,
    options: {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  });
}

export function getRSFormDetails(target: string, version: string, request: FrontPull<IRSFormData>) {
  if (!version) {
    AxiosGet({
      endpoint: `/api/rsforms/${target}/details`,
      request: request
    });
  } else {
    AxiosGet({
      endpoint: `/api/library/${target}/versions/${version}`,
      request: request
    });
  }
}

export function getTRSFile(target: string, version: string, request: FrontPull<Blob>) {
  if (!version) {
    AxiosGet({
      endpoint: `/api/rsforms/${target}/export-trs`,
      request: request,
      options: { responseType: 'blob' }
    });
  } else {
    AxiosGet({
      endpoint: `/api/versions/${version}/export-file`,
      request: request,
      options: { responseType: 'blob' }
    });
  }
}

export function postCreateConstituenta(schema: string, request: FrontExchange<ICstCreateData, ICstCreatedResponse>) {
  AxiosPost({
    endpoint: `/api/rsforms/${schema}/create-cst`,
    request: request
  });
}

export function patchUpdateConstituenta(schema: string, request: FrontExchange<ICstUpdateData, IConstituentaMeta>) {
  AxiosPatch({
    endpoint: `/api/rsforms/${schema}/update-cst`,
    request: request
  });
}

export function patchDeleteConstituenta(schema: string, request: FrontExchange<IConstituentaList, IRSFormData>) {
  AxiosPatch({
    endpoint: `/api/rsforms/${schema}/delete-multiple-cst`,
    request: request
  });
}

export function patchRenameConstituenta(schema: string, request: FrontExchange<ICstRenameData, ICstCreatedResponse>) {
  AxiosPatch({
    endpoint: `/api/rsforms/${schema}/rename-cst`,
    request: request
  });
}

export function patchProduceStructure(schema: string, request: FrontExchange<ITargetCst, IProduceStructureResponse>) {
  AxiosPatch({
    endpoint: `/api/rsforms/${schema}/produce-structure`,
    request: request
  });
}

export function patchSubstituteConstituents(schema: string, request: FrontExchange<ICstSubstituteData, IRSFormData>) {
  AxiosPatch({
    endpoint: `/api/rsforms/${schema}/substitute`,
    request: request
  });
}

export function patchMoveConstituenta(schema: string, request: FrontExchange<ICstMovetoData, IRSFormData>) {
  AxiosPatch({
    endpoint: `/api/rsforms/${schema}/move-cst`,
    request: request
  });
}

export function postCheckConstituenta(
  schema: string,
  request: FrontExchange<ICheckConstituentaData, IExpressionParse>
) {
  AxiosPost({
    endpoint: `/api/rsforms/${schema}/check-constituenta`,
    request: request
  });
}

export function patchResetAliases(target: string, request: FrontPull<IRSFormData>) {
  AxiosPatch({
    endpoint: `/api/rsforms/${target}/reset-aliases`,
    request: request
  });
}

export function patchRestoreOrder(target: string, request: FrontPull<IRSFormData>) {
  AxiosPatch({
    endpoint: `/api/rsforms/${target}/restore-order`,
    request: request
  });
}

export function patchUploadTRS(target: string, request: FrontExchange<IRSFormUploadData, IRSFormData>) {
  AxiosPatch({
    endpoint: `/api/rsforms/${target}/load-trs`,
    request: request,
    options: {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  });
}

export function patchInlineSynthesis(request: FrontExchange<IInlineSynthesisData, IRSFormData>) {
  AxiosPatch({
    endpoint: `/api/rsforms/inline-synthesis`,
    request: request
  });
}
