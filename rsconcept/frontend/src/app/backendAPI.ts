/**
 * Module: API for backend communications.
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';

import { type ErrorData } from '@/components/info/InfoError';
import { ILexemeData, ITextRequest, ITextResult, IWordFormPlain } from '@/models/language';
import {
  AccessPolicy,
  ILibraryItem,
  ILibraryUpdateData,
  ITargetAccessPolicy,
  ITargetLocation,
  IVersionData,
  LibraryItemType
} from '@/models/library';
import { ILibraryCreateData } from '@/models/library';
import { IOperationSchemaData } from '@/models/oss';
import {
  IConstituentaList,
  IConstituentaMeta,
  ICstCreateData,
  ICstCreatedResponse,
  ICstMovetoData,
  ICstRenameData,
  ICstSubstituteData,
  ICstUpdateData,
  IInlineSynthesisData,
  IProduceStructureResponse,
  IRSFormCloneData,
  IRSFormData,
  IRSFormUploadData,
  ITargetCst,
  IVersionCreatedResponse
} from '@/models/rsform';
import { IExpressionParse, IRSExpression } from '@/models/rslang';
import {
  ICurrentUser,
  IPasswordTokenData,
  IRequestPasswordData,
  IResetPasswordData,
  ITargetUser,
  ITargetUsers,
  IUserInfo,
  IUserLoginData,
  IUserProfile,
  IUserSignupData,
  IUserUpdateData,
  IUserUpdatePassword
} from '@/models/user';
import { buildConstants } from '@/utils/buildConstants';

const defaultOptions = {
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'x-csrftoken',
  baseURL: `${buildConstants.backend}`,
  withCredentials: true
};

const axiosInstance = axios.create(defaultOptions);
axiosInstance.interceptors.request.use(config => {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  if (token) {
    config.headers['x-csrftoken'] = token;
  }
  return config;
});

// ================ Data transfer types ================
export type DataCallback<ResponseData = undefined> = (data: ResponseData) => void;

interface IFrontRequest<RequestData, ResponseData> {
  data?: RequestData;
  onSuccess?: DataCallback<ResponseData>;
  onError?: (error: ErrorData) => void;
  setLoading?: (loading: boolean) => void;
  showError?: boolean;
}

export interface FrontPush<DataType> extends IFrontRequest<DataType, undefined> {
  data: DataType;
}
export interface FrontPull<DataType> extends IFrontRequest<undefined, DataType> {
  onSuccess: DataCallback<DataType>;
}

export interface FrontExchange<RequestData, ResponseData> extends IFrontRequest<RequestData, ResponseData> {
  data: RequestData;
  onSuccess: DataCallback<ResponseData>;
}

export interface FrontAction extends IFrontRequest<undefined, undefined> {}

interface IAxiosRequest<RequestData, ResponseData> {
  endpoint: string;
  request: IFrontRequest<RequestData, ResponseData>;
  options?: AxiosRequestConfig;
}

// ==================== API ====================
export function getAuth(request: FrontPull<ICurrentUser>) {
  AxiosGet({
    endpoint: `/users/api/auth`,
    request: request
  });
}

export function postLogin(request: FrontPush<IUserLoginData>) {
  AxiosPost({
    endpoint: '/users/api/login',
    request: request
  });
}

export function postLogout(request: FrontAction) {
  AxiosPost({
    endpoint: '/users/api/logout',
    request: request
  });
}

export function postSignup(request: FrontExchange<IUserSignupData, IUserProfile>) {
  AxiosPost({
    endpoint: '/users/api/signup',
    request: request
  });
}

export function getProfile(request: FrontPull<IUserProfile>) {
  AxiosGet({
    endpoint: '/users/api/profile',
    request: request
  });
}

export function patchProfile(request: FrontExchange<IUserUpdateData, IUserProfile>) {
  AxiosPatch({
    endpoint: '/users/api/profile',
    request: request
  });
}

export function patchPassword(request: FrontPush<IUserUpdatePassword>) {
  AxiosPatch({
    endpoint: '/users/api/change-password',
    request: request
  });
}

export function postRequestPasswordReset(request: FrontPush<IRequestPasswordData>) {
  // title: 'Request password reset',
  AxiosPost({
    endpoint: '/users/api/password-reset',
    request: request
  });
}

export function postValidatePasswordToken(request: FrontPush<IPasswordTokenData>) {
  // title: 'Validate password token',
  AxiosPost({
    endpoint: '/users/api/password-reset/validate',
    request: request
  });
}

export function postResetPassword(request: FrontPush<IResetPasswordData>) {
  // title: 'Reset password',
  AxiosPost({
    endpoint: '/users/api/password-reset/confirm',
    request: request
  });
}

export function getActiveUsers(request: FrontPull<IUserInfo[]>) {
  // title: 'Active users list',
  AxiosGet({
    endpoint: '/users/api/active-users',
    request: request
  });
}

export function getLibrary(request: FrontPull<ILibraryItem[]>) {
  // title: 'Available LibraryItems list',
  AxiosGet({
    endpoint: '/api/library/active',
    request: request
  });
}

export function getAdminLibrary(request: FrontPull<ILibraryItem[]>) {
  // title: 'All LibraryItems list',
  AxiosGet({
    endpoint: '/api/library/all',
    request: request
  });
}

export function getTemplates(request: FrontPull<ILibraryItem[]>) {
  AxiosGet({
    endpoint: '/api/library/templates',
    request: request
  });
}

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

export function postCreateLibraryItem(request: FrontExchange<ILibraryCreateData, ILibraryItem>) {
  AxiosPost({
    endpoint: '/api/library',
    request: request
  });
}

export function postCloneLibraryItem(target: string, request: FrontExchange<IRSFormCloneData, IRSFormData>) {
  AxiosPost({
    endpoint: `/api/library/${target}/clone`,
    request: request
  });
}

export function getOssDetails(target: string, request: FrontPull<IOperationSchemaData>) {
  request.onSuccess({
    id: Number(target),
    comment: '123',
    alias: 'oss1',
    access_policy: AccessPolicy.PUBLIC,
    editors: [],
    owner: 1,
    item_type: LibraryItemType.OSS,
    location: '/U',
    read_only: false,
    subscribers: [],
    time_create: '0',
    time_update: '0',
    title: 'TestOss',
    visible: false
  });
  // AxiosGet({
  //   endpoint: `/api/oss/${target}`, // TODO: endpoint to access OSS
  //   request: request
  // });
}

export function getRSFormDetails(target: string, version: string, request: FrontPull<IRSFormData>) {
  if (!version) {
    AxiosGet({
      endpoint: `/api/rsforms/${target}/details`,
      request: request
    });
  } else {
    AxiosGet({
      endpoint: `/api/rsforms/${target}/versions/${version}`,
      request: request
    });
  }
}

export function patchLibraryItem(target: string, request: FrontExchange<ILibraryUpdateData, ILibraryItem>) {
  AxiosPatch({
    endpoint: `/api/library/${target}`,
    request: request
  });
}

export function deleteLibraryItem(target: string, request: FrontAction) {
  AxiosDelete({
    endpoint: `/api/library/${target}`,
    request: request
  });
}

export function patchSetOwner(target: string, request: FrontPush<ITargetUser>) {
  AxiosPatch({
    endpoint: `/api/library/${target}/set-owner`,
    request: request
  });
}

export function patchSetAccessPolicy(target: string, request: FrontPush<ITargetAccessPolicy>) {
  AxiosPatch({
    endpoint: `/api/library/${target}/set-access-policy`,
    request: request
  });
}

export function patchSetLocation(target: string, request: FrontPush<ITargetLocation>) {
  AxiosPatch({
    endpoint: `/api/library/${target}/set-location`,
    request: request
  });
}

export function patchEditorsAdd(target: string, request: FrontPush<ITargetUser>) {
  AxiosPatch({
    endpoint: `/api/library/${target}/editors-add`,
    request: request
  });
}

export function patchEditorsRemove(target: string, request: FrontPush<ITargetUser>) {
  AxiosPatch({
    endpoint: `/api/library/${target}/editors-remove`,
    request: request
  });
}

export function patchEditorsSet(target: string, request: FrontPush<ITargetUsers>) {
  AxiosPatch({
    endpoint: `/api/library/${target}/editors-set`,
    request: request
  });
}

export function postSubscribe(target: string, request: FrontAction) {
  AxiosPost({
    endpoint: `/api/library/${target}/subscribe`,
    request: request
  });
}

export function deleteUnsubscribe(target: string, request: FrontAction) {
  AxiosDelete({
    endpoint: `/api/library/${target}/unsubscribe`,
    request: request
  });
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

export function postNewConstituenta(schema: string, request: FrontExchange<ICstCreateData, ICstCreatedResponse>) {
  AxiosPost({
    endpoint: `/api/rsforms/${schema}/cst-create`,
    request: request
  });
}

export function patchDeleteConstituenta(schema: string, request: FrontExchange<IConstituentaList, IRSFormData>) {
  AxiosPatch({
    endpoint: `/api/rsforms/${schema}/cst-delete-multiple`,
    request: request
  });
}

export function patchConstituenta(target: string, request: FrontExchange<ICstUpdateData, IConstituentaMeta>) {
  AxiosPatch({
    endpoint: `/api/constituents/${target}`,
    request: request
  });
}

export function patchRenameConstituenta(schema: string, request: FrontExchange<ICstRenameData, ICstCreatedResponse>) {
  AxiosPatch({
    endpoint: `/api/rsforms/${schema}/cst-rename`,
    request: request
  });
}

export function patchProduceStructure(schema: string, request: FrontExchange<ITargetCst, IProduceStructureResponse>) {
  AxiosPatch({
    endpoint: `/api/rsforms/${schema}/cst-produce-structure`,
    request: request
  });
}

export function patchSubstituteConstituents(schema: string, request: FrontExchange<ICstSubstituteData, IRSFormData>) {
  AxiosPatch({
    endpoint: `/api/rsforms/${schema}/cst-substitute`,
    request: request
  });
}

export function patchMoveConstituenta(schema: string, request: FrontExchange<ICstMovetoData, IRSFormData>) {
  AxiosPatch({
    endpoint: `/api/rsforms/${schema}/cst-moveto`,
    request: request
  });
}

export function postCheckExpression(schema: string, request: FrontExchange<IRSExpression, IExpressionParse>) {
  AxiosPost({
    endpoint: `/api/rsforms/${schema}/check`,
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
    endpoint: `/api/operations/inline-synthesis`,
    request: request
  });
}

export function postInflectText(request: FrontExchange<IWordFormPlain, ITextResult>) {
  AxiosPost({
    endpoint: `/api/cctext/inflect`,
    request: request
  });
}

export function postParseText(request: FrontExchange<ITextRequest, ITextResult>) {
  AxiosPost({
    endpoint: `/api/cctext/parse`,
    request: request
  });
}

export function postGenerateLexeme(request: FrontExchange<ITextRequest, ILexemeData>) {
  // title: `Parse text ${request.data.text}`,
  AxiosPost({
    endpoint: `/api/cctext/generate-lexeme`,
    request: request
  });
}

export function postCreateVersion(target: string, request: FrontExchange<IVersionData, IVersionCreatedResponse>) {
  // title: `Create version for RSForm id=${target}`,
  AxiosPost({
    endpoint: `/api/rsforms/${target}/versions/create`,
    request: request
  });
}

export function patchVersion(target: string, request: FrontPush<IVersionData>) {
  // title: `Version id=${target}`,
  AxiosPatch({
    endpoint: `/api/versions/${target}`,
    request: request
  });
}

export function patchRestoreVersion(target: string, request: FrontPull<IRSFormData>) {
  AxiosPatch({
    endpoint: `/api/versions/${target}/restore`,
    request: request
  });
}

export function deleteVersion(target: string, request: FrontAction) {
  AxiosDelete({
    endpoint: `/api/versions/${target}`,
    request: request
  });
}

// ============ Helper functions =============
function AxiosGet<ResponseData>({ endpoint, request, options }: IAxiosRequest<undefined, ResponseData>) {
  if (request.setLoading) request.setLoading(true);
  axiosInstance
    .get<ResponseData>(endpoint, options)
    .then(response => {
      if (request.setLoading) request.setLoading(false);
      if (request.onSuccess) request.onSuccess(response.data);
    })
    .catch((error: Error | AxiosError) => {
      if (request.setLoading) request.setLoading(false);
      if (request.showError) toast.error(error.message);
      if (request.onError) request.onError(error);
    });
}

function AxiosPost<RequestData, ResponseData>({
  endpoint,
  request,
  options
}: IAxiosRequest<RequestData, ResponseData>) {
  if (request.setLoading) request.setLoading(true);
  axiosInstance
    .post<ResponseData>(endpoint, request.data, options)
    .then(response => {
      if (request.setLoading) request.setLoading(false);
      if (request.onSuccess) request.onSuccess(response.data);
    })
    .catch((error: Error | AxiosError) => {
      if (request.setLoading) request.setLoading(false);
      if (request.showError) toast.error(error.message);
      if (request.onError) request.onError(error);
    });
}

function AxiosDelete<RequestData, ResponseData>({
  endpoint,
  request,
  options
}: IAxiosRequest<RequestData, ResponseData>) {
  if (request.setLoading) request.setLoading(true);
  axiosInstance
    .delete<ResponseData>(endpoint, options)
    .then(response => {
      if (request.setLoading) request.setLoading(false);
      if (request.onSuccess) request.onSuccess(response.data);
    })
    .catch((error: Error | AxiosError) => {
      if (request.setLoading) request.setLoading(false);
      if (request.showError) toast.error(error.message);
      if (request.onError) request.onError(error);
    });
}

function AxiosPatch<RequestData, ResponseData>({
  endpoint,
  request,
  options
}: IAxiosRequest<RequestData, ResponseData>) {
  if (request.setLoading) request.setLoading(true);
  axiosInstance
    .patch<ResponseData>(endpoint, request.data, options)
    .then(response => {
      if (request.setLoading) request.setLoading(false);
      if (request.onSuccess) request.onSuccess(response.data);
      return response.data;
    })
    .catch((error: Error | AxiosError) => {
      if (request.setLoading) request.setLoading(false);
      if (request.showError) toast.error(error.message);
      if (request.onError) request.onError(error);
    });
}
