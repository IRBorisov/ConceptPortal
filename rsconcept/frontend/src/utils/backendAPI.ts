/**
 * Module: API for backend communications.
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';

import { type ErrorData } from '@/components/InfoError';
import { ILexemeData, IResolutionData, ITextRequest, ITextResult, IWordFormPlain } from '@/models/language';
import {
  ICurrentUser,
  ILibraryItem,
  ILibraryUpdateData,
  IPasswordTokenData,
  IRequestPasswordData,
  IResetPasswordData as IResetPasswordData,
  IUserInfo,
  IUserLoginData,
  IUserProfile,
  IUserSignupData,
  IUserUpdateData,
  IUserUpdatePassword,
  IVersionData
} from '@/models/library';
import {
  IConstituentaList,
  IConstituentaMeta,
  ICstCreateData,
  ICstCreatedResponse,
  ICstID,
  ICstMovetoData,
  ICstRenameData,
  ICstSubstituteData,
  ICstUpdateData,
  IProduceStructureResponse,
  IRSFormCreateData,
  IRSFormData,
  IRSFormUploadData,
  IVersionCreatedResponse
} from '@/models/rsform';
import { IExpressionParse, IRSExpression } from '@/models/rslang';

import { buildConstants } from './constants';

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
  title: string;
  options?: AxiosRequestConfig;
}

// ==================== API ====================
export function getAuth(request: FrontPull<ICurrentUser>) {
  AxiosGet({
    title: 'Current user',
    endpoint: `/users/api/auth`,
    request: request
  });
}

export function postLogin(request: FrontPush<IUserLoginData>) {
  AxiosPost({
    title: 'Login',
    endpoint: '/users/api/login',
    request: request
  });
}

export function postLogout(request: FrontAction) {
  AxiosPost({
    title: 'Logout',
    endpoint: '/users/api/logout',
    request: request
  });
}

export function postSignup(request: FrontExchange<IUserSignupData, IUserProfile>) {
  AxiosPost({
    title: 'Register user',
    endpoint: '/users/api/signup',
    request: request
  });
}

export function getProfile(request: FrontPull<IUserProfile>) {
  AxiosGet({
    title: 'Current user profile',
    endpoint: '/users/api/profile',
    request: request
  });
}

export function patchProfile(request: FrontExchange<IUserUpdateData, IUserProfile>) {
  AxiosPatch({
    title: 'Current user profile',
    endpoint: '/users/api/profile',
    request: request
  });
}

export function patchPassword(request: FrontPush<IUserUpdatePassword>) {
  AxiosPatch({
    title: 'Update password',
    endpoint: '/users/api/change-password',
    request: request
  });
}

export function postRequestPasswordReset(request: FrontPush<IRequestPasswordData>) {
  AxiosPost({
    title: 'Request password reset',
    endpoint: '/users/api/password-reset',
    request: request
  });
}

export function postValidatePasswordToken(request: FrontPush<IPasswordTokenData>) {
  AxiosPost({
    title: 'Validate password token',
    endpoint: '/users/api/password-reset/validate',
    request: request
  });
}

export function postResetPassword(request: FrontPush<IResetPasswordData>) {
  AxiosPost({
    title: 'Reset password',
    endpoint: '/users/api/password-reset/confirm',
    request: request
  });
}

export function getActiveUsers(request: FrontPull<IUserInfo[]>) {
  AxiosGet({
    title: 'Active users list',
    endpoint: '/users/api/active-users',
    request: request
  });
}

export function getLibrary(request: FrontPull<ILibraryItem[]>) {
  AxiosGet({
    title: 'Available LibraryItems list',
    endpoint: '/api/library/active',
    request: request
  });
}

export function getTemplates(request: FrontPull<ILibraryItem[]>) {
  AxiosGet({
    title: 'Available LibraryItems list',
    endpoint: '/api/library/templates',
    request: request
  });
}

export function postNewRSForm(request: FrontExchange<IRSFormCreateData, ILibraryItem>) {
  AxiosPost({
    title: 'New RSForm',
    endpoint: '/api/rsforms/create-detailed',
    request: request,
    options: {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  });
}

export function postCloneLibraryItem(target: string, request: FrontExchange<IRSFormCreateData, IRSFormData>) {
  AxiosPost({
    title: 'Clone RSForm',
    endpoint: `/api/library/${target}/clone`,
    request: request
  });
}

export function getRSFormDetails(target: string, version: string, request: FrontPull<IRSFormData>) {
  if (!version) {
    AxiosGet({
      title: `RSForm details for id=${target}`,
      endpoint: `/api/rsforms/${target}/details`,
      request: request
    });
  } else {
    AxiosGet({
      title: `RSForm details for id=${target} version=${version}`,
      endpoint: `/api/rsforms/${target}/versions/${version}`,
      request: request
    });
  }
}

export function patchLibraryItem(target: string, request: FrontExchange<ILibraryUpdateData, ILibraryItem>) {
  AxiosPatch({
    title: `LibraryItem id=${target}`,
    endpoint: `/api/library/${target}`,
    request: request
  });
}

export function deleteLibraryItem(target: string, request: FrontAction) {
  AxiosDelete({
    title: `LibraryItem id=${target}`,
    endpoint: `/api/library/${target}`,
    request: request
  });
}

export function postClaimLibraryItem(target: string, request: FrontPull<ILibraryItem>) {
  AxiosPost({
    title: `Claim on LibraryItem id=${target}`,
    endpoint: `/api/library/${target}/claim`,
    request: request
  });
}

export function postSubscribe(target: string, request: FrontAction) {
  AxiosPost({
    title: `Subscribe to LibraryItem id=${target}`,
    endpoint: `/api/library/${target}/subscribe`,
    request: request
  });
}

export function deleteUnsubscribe(target: string, request: FrontAction) {
  AxiosDelete({
    title: `Unsubscribe from LibraryItem id=${target}`,
    endpoint: `/api/library/${target}/unsubscribe`,
    request: request
  });
}

export function getTRSFile(target: string, version: string, request: FrontPull<Blob>) {
  if (!version) {
    AxiosGet({
      title: `RSForm TRS file for id=${target}`,
      endpoint: `/api/rsforms/${target}/export-trs`,
      request: request,
      options: { responseType: 'blob' }
    });
  } else {
    AxiosGet({
      title: `RSForm TRS file for id=${target} version=${version}`,
      endpoint: `/api/versions/${version}/export-file`,
      request: request,
      options: { responseType: 'blob' }
    });
  }
}

export function postNewConstituenta(schema: string, request: FrontExchange<ICstCreateData, ICstCreatedResponse>) {
  AxiosPost({
    title: `New Constituenta for RSForm id=${schema}: ${request.data.alias}`,
    endpoint: `/api/rsforms/${schema}/cst-create`,
    request: request
  });
}

export function patchDeleteConstituenta(schema: string, request: FrontExchange<IConstituentaList, IRSFormData>) {
  AxiosPatch({
    title: `Delete Constituents for RSForm id=${schema}: ${request.data.items.map(item => String(item)).join(' ')}`,
    endpoint: `/api/rsforms/${schema}/cst-delete-multiple`,
    request: request
  });
}

export function patchConstituenta(target: string, request: FrontExchange<ICstUpdateData, IConstituentaMeta>) {
  AxiosPatch({
    title: `Constituenta id=${target}`,
    endpoint: `/api/constituents/${target}`,
    request: request
  });
}

export function patchRenameConstituenta(schema: string, request: FrontExchange<ICstRenameData, ICstCreatedResponse>) {
  AxiosPatch({
    title: `Renaming constituenta id=${request.data.id} for schema id=${schema}`,
    endpoint: `/api/rsforms/${schema}/cst-rename`,
    request: request
  });
}

export function patchProduceStructure(schema: string, request: FrontExchange<ICstID, IProduceStructureResponse>) {
  AxiosPatch({
    title: `Producing structure constituenta id=${request.data.id} for schema id=${schema}`,
    endpoint: `/api/rsforms/${schema}/cst-produce-structure`,
    request: request
  });
}

export function patchSubstituteConstituenta(schema: string, request: FrontExchange<ICstSubstituteData, IRSFormData>) {
  AxiosPatch({
    title: `Substitution for constituenta id=${request.data.original} for schema id=${schema}`,
    endpoint: `/api/rsforms/${schema}/cst-substitute`,
    request: request
  });
}

export function patchMoveConstituenta(schema: string, request: FrontExchange<ICstMovetoData, IRSFormData>) {
  AxiosPatch({
    title: `Moving Constituents for RSForm id=${schema}: ${JSON.stringify(request.data.items)} to ${
      request.data.move_to
    }`,
    endpoint: `/api/rsforms/${schema}/cst-moveto`,
    request: request
  });
}

export function postCheckExpression(schema: string, request: FrontExchange<IRSExpression, IExpressionParse>) {
  AxiosPost({
    title: `Check expression for RSForm id=${schema}: ${request.data.expression}`,
    endpoint: `/api/rsforms/${schema}/check`,
    request: request
  });
}

export function patchResetAliases(target: string, request: FrontPull<IRSFormData>) {
  AxiosPatch({
    title: `Reset alias for RSForm id=${target}`,
    endpoint: `/api/rsforms/${target}/reset-aliases`,
    request: request
  });
}

export function patchUploadTRS(target: string, request: FrontExchange<IRSFormUploadData, IRSFormData>) {
  AxiosPatch({
    title: `Replacing data with trs file for RSForm id=${target}`,
    endpoint: `/api/rsforms/${target}/load-trs`,
    request: request,
    options: {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  });
}

export function postResolveText(schema: string, request: FrontExchange<ITextRequest, IResolutionData>) {
  AxiosPost({
    title: `Resolve text references for RSForm id=${schema}: ${request.data.text}`,
    endpoint: `/api/rsforms/${schema}/resolve`,
    request: request
  });
}

export function postInflectText(request: FrontExchange<IWordFormPlain, ITextResult>) {
  AxiosPost({
    title: `Inflect text ${request.data.text} to ${request.data.grams}`,
    endpoint: `/api/cctext/inflect`,
    request: request
  });
}

export function postParseText(request: FrontExchange<ITextRequest, ITextResult>) {
  AxiosPost({
    title: `Parse text ${request.data.text}`,
    endpoint: `/api/cctext/parse`,
    request: request
  });
}

export function postGenerateLexeme(request: FrontExchange<ITextRequest, ILexemeData>) {
  AxiosPost({
    title: `Parse text ${request.data.text}`,
    endpoint: `/api/cctext/generate-lexeme`,
    request: request
  });
}

export function postCreateVersion(target: string, request: FrontExchange<IVersionData, IVersionCreatedResponse>) {
  AxiosPost({
    title: `Create version for RSForm id=${target}`,
    endpoint: `/api/rsforms/${target}/versions/create`,
    request: request
  });
}

export function patchVersion(target: string, request: FrontPush<IVersionData>) {
  AxiosPatch({
    title: `Version id=${target}`,
    endpoint: `/api/versions/${target}`,
    request: request
  });
}

export function deleteVersion(target: string, request: FrontAction) {
  AxiosDelete({
    title: `Version id=${target}`,
    endpoint: `/api/versions/${target}`,
    request: request
  });
}

// ============ Helper functions =============
function AxiosGet<ResponseData>({ endpoint, request, title, options }: IAxiosRequest<undefined, ResponseData>) {
  console.log(`REQUEST: [[${title}]]`);
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
  title,
  options
}: IAxiosRequest<RequestData, ResponseData>) {
  console.log(`POST: [[${title}]]`);
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
  title,
  options
}: IAxiosRequest<RequestData, ResponseData>) {
  console.log(`DELETE: [[${title}]]`);
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
  title,
  options
}: IAxiosRequest<RequestData, ResponseData>) {
  console.log(`PATCH: [[${title}]]`);
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
