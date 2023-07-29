import axios, { AxiosRequestConfig } from 'axios'
import { toast } from 'react-toastify'

import { type ErrorInfo } from '../components/BackendError'
import { FilterType, RSFormsFilter } from '../hooks/useRSForms'
import { config } from './constants'
import {
  IConstituentaList,
  IConstituentaMeta,
  ICstCreateData, ICstCreatedResponse, ICstMovetoData, ICstUpdateData,
  ICurrentUser,   IExpressionParse,
IRSExpression,
IRSFormCreateData, IRSFormData,
  IRSFormMeta, IRSFormUpdateData, IRSFormUploadData, IUserInfo,
  IUserLoginData, IUserProfile, IUserSignupData} from './models'

// ================ Data transfer types ================
export type DataCallback<ResponseData = undefined> = (data: ResponseData) => void;

interface IFrontRequest<RequestData, ResponseData> {
  data?: RequestData
  onSuccess?: DataCallback<ResponseData>
  onError?: (error: ErrorInfo) => void
  setLoading?: (loading: boolean) => void
  showError?: boolean
}

export interface FrontPush<DataType> extends IFrontRequest<DataType, undefined> {
  data: DataType
}
export interface FrontPull<DataType> extends IFrontRequest<undefined, DataType>{
  onSuccess: DataCallback<DataType>
}

export interface FrontExchange<RequestData, ResponseData> extends IFrontRequest<RequestData, ResponseData>{
  data: RequestData
  onSuccess: DataCallback<ResponseData>
}

export interface FrontAction extends IFrontRequest<undefined, undefined>{}

interface IAxiosRequest<RequestData, ResponseData> {
  endpoint: string
  request: IFrontRequest<RequestData, ResponseData>
  title: string
  options?: AxiosRequestConfig
}

// ==================== API ====================
export function getAuth(request: FrontPull<ICurrentUser>) {
  AxiosGet({
    title: 'Current user',
    endpoint: `${config.url.AUTH}auth`,
    request: request
  });
}

export function postLogin(request: FrontPush<IUserLoginData>) {
  AxiosPost({
    title: 'Login',
    endpoint: `${config.url.AUTH}login`,
    request: request
  });
}

export function postLogout(request: FrontAction) {
  AxiosPost({
    title: 'Logout',
    endpoint: `${config.url.AUTH}logout`,
    request: request
  });
}

export function postSignup(request: IFrontRequest<IUserSignupData, IUserProfile>) {
  AxiosPost({
    title: 'Register user',
    endpoint: `${config.url.AUTH}signup`,
    request: request
  });
}

export function getProfile(request: FrontPull<IUserProfile>) {
  AxiosGet({
    title: 'Current user profile',
    endpoint: `${config.url.AUTH}profile`,
    request: request
  });
}

export function getActiveUsers(request: FrontPull<IUserInfo[]>) {
  AxiosGet({
    title: 'Active users list',
    endpoint: `${config.url.AUTH}active-users`,
    request: request
  });
}

export function getRSForms(filter: RSFormsFilter, request: FrontPull<IRSFormMeta[]>) {
  const endpoint =
    filter.type === FilterType.PERSONAL
    ? `${config.url.BASE}rsforms?owner=${filter.data as number}`
    : `${config.url.BASE}rsforms?is_common=true`;
  AxiosGet({
    title: 'RSForms list',
    endpoint: endpoint,
    request: request
  });
}

export function postNewRSForm(request: FrontExchange<IRSFormCreateData, IRSFormMeta>) {
  AxiosPost({
    title: 'New RSForm',
    endpoint: `${config.url.BASE}rsforms/create-detailed/`,
    request: request,
    options: {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  });
}

export function postCloneRSForm(schema: string, request: FrontExchange<IRSFormCreateData, IRSFormData>) {
  AxiosPost({
    title: 'clone RSForm',
    endpoint: `${config.url.BASE}rsforms/${schema}/clone/`,
    request: request
  });
}

export function getRSFormDetails(target: string, request: FrontPull<IRSFormData>) {
  AxiosGet({
    title: `RSForm details for id=${target}`,
    endpoint: `${config.url.BASE}rsforms/${target}/details/`,
    request: request
  });
}

export function patchRSForm(target: string, request: FrontExchange<IRSFormUpdateData, IRSFormMeta>) {
  AxiosPatch({
    title: `RSForm id=${target}`,
    endpoint: `${config.url.BASE}rsforms/${target}/`,
    request: request
  });
}

export function deleteRSForm(target: string, request: FrontAction) {
  AxiosDelete({
    title: `RSForm id=${target}`,
    endpoint: `${config.url.BASE}rsforms/${target}/`,
    request: request
  });
}

export function postClaimRSForm(target: string, request: FrontPull<IRSFormMeta>) {
  AxiosPost({
    title: `Claim on RSForm id=${target}`,
    endpoint: `${config.url.BASE}rsforms/${target}/claim/`,
    request: request
  });
}

export function getTRSFile(target: string, request: FrontPull<Blob>) {
  AxiosGet({
    title: `RSForm TRS file for id=${target}`,
    endpoint: `${config.url.BASE}rsforms/${target}/export-trs/`,
    request: request,
    options: { responseType: 'blob' }
  });
}

export function postNewConstituenta(schema: string, request: FrontExchange<ICstCreateData, ICstCreatedResponse>) {
  AxiosPost({
    title: `New Constituenta for RSForm id=${schema}: ${request.data.alias}`,
    endpoint: `${config.url.BASE}rsforms/${schema}/cst-create/`,
    request: request
  });
}

export function patchDeleteConstituenta(schema: string, request: FrontExchange<IConstituentaList, IRSFormData>) {
  AxiosPatch({
    title: `Delete Constituents for RSForm id=${schema}: ${request.data.items.map(item => String(item.id)).join(' ')}`,
    endpoint: `${config.url.BASE}rsforms/${schema}/cst-multidelete/`,
    request: request
  });
}

export function patchConstituenta(target: string, request: FrontExchange<ICstUpdateData, IConstituentaMeta>) {
  AxiosPatch({
    title: `Constituenta id=${target}`,
    endpoint: `${config.url.BASE}constituents/${target}/`,
    request: request
  });
}

export function patchMoveConstituenta(schema: string, request: FrontExchange<ICstMovetoData, IRSFormData>) {
  AxiosPatch({
    title: `Moving Constituents for RSForm id=${schema}: ${JSON.stringify(request.data.items)} to ${request.data.move_to}`,
    endpoint: `${config.url.BASE}rsforms/${schema}/cst-moveto/`,
    request: request
  });
}

export function postCheckExpression(schema: string, request: FrontExchange<IRSExpression, IExpressionParse>) {
  AxiosPost({
    title: `Check expression for RSForm id=${schema}: ${request.data.expression }`,
    endpoint: `${config.url.BASE}rsforms/${schema}/check/`,
    request: request
  });
}

export function patchResetAliases(target: string, request: FrontPull<IRSFormData>) {
  AxiosPatch({
    title: `Reset alias for RSForm id=${target}`,
    endpoint: `${config.url.BASE}rsforms/${target}/reset-aliases/`,
    request: request
  });
}

export function patchUploadTRS(target: string, request: FrontExchange<IRSFormUploadData, IRSFormData>) {
  AxiosPatch({
    title: `Replacing data with trs file for RSForm id=${target}`,
    endpoint: `${config.url.BASE}rsforms/${target}/load-trs/`,
    request: request,
    options: {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  });
}

// ============ Helper functions =============
function AxiosGet<ResponseData>({ endpoint, request, title, options }: IAxiosRequest<undefined, ResponseData>) {
  console.log(`REQUEST: [[${title}]]`);
  if (request.setLoading) request.setLoading(true);
  axios.get<ResponseData>(endpoint, options)
    .then((response) => {
      if (request.setLoading) request.setLoading(false);
      if (request.onSuccess) request.onSuccess(response.data);
    })
    .catch((error) => {
      if (request.setLoading) request.setLoading(false);
      if (request.showError) toast.error(error.message);
      if (request.onError) request.onError(error);
    });
}

function AxiosPost<RequestData, ResponseData>(
  { endpoint, request, title, options }: IAxiosRequest<RequestData, ResponseData>
) {
  console.log(`POST: [[${title}]]`);
  if (request.setLoading) request.setLoading(true);
  axios.post<ResponseData>(endpoint, request.data, options)
    .then((response) => {
      if (request.setLoading) request.setLoading(false);
      if (request.onSuccess) request.onSuccess(response.data);
    })
    .catch((error) => {
      if (request.setLoading) request.setLoading(false);
      if (request.showError) toast.error(error.message);
      if (request.onError) request.onError(error);
    });
}

function AxiosDelete<RequestData, ResponseData>(
  { endpoint, request, title, options }: IAxiosRequest<RequestData, ResponseData>
) {
  console.log(`DELETE: [[${title}]]`);
  if (request.setLoading) request.setLoading(true);
  axios.delete<ResponseData>(endpoint, options)
    .then((response) => {
      if (request.setLoading) request.setLoading(false);
      if (request.onSuccess) request.onSuccess(response.data);
    })
    .catch((error) => {
      if (request.setLoading) request.setLoading(false);
      if (request.showError) toast.error(error.message);
      if (request.onError) request.onError(error);
    });
}

function AxiosPatch<RequestData, ResponseData>(
  { endpoint, request, title, options }: IAxiosRequest<RequestData, ResponseData>
) {
  console.log(`PATCH: [[${title}]]`);
  if (request.setLoading) request.setLoading(true);
  axios.patch<ResponseData>(endpoint, request.data, options)
    .then((response) => {
      if (request.setLoading) request.setLoading(false);
      if (request.onSuccess) request.onSuccess(response.data);
      return response.data;
    })
    .catch((error) => {
      if (request.setLoading) request.setLoading(false);
      if (request.showError) toast.error(error.message);
      if (request.onError) request.onError(error);
    });
}
