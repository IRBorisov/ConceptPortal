import axios, { type AxiosResponse } from 'axios'
import { toast } from 'react-toastify'

import { type ErrorInfo } from '../components/BackendError'
import { FilterType, type RSFormsFilter } from '../hooks/useRSForms'
import { config } from './constants'
import { type ICurrentUser, type IRSForm, type IUserInfo, type IUserProfile } from './models'

export type BackendCallback = (response: AxiosResponse) => void;

export interface IFrontRequest {
  onSuccess?: BackendCallback
  onError?: (error: ErrorInfo) => void
  setLoading?: (loading: boolean) => void
  showError?: boolean
  data?: any
}

interface IAxiosRequest {
  endpoint: string
  request?: IFrontRequest
  title?: string
}

// ================= Export API ==============
export async function postLogin(request?: IFrontRequest) {
  await AxiosPost({
    title: 'Login',
    endpoint: `${config.url.AUTH}login`,
    request
  });
}

export async function getAuth(request?: IFrontRequest) {
  await AxiosGet<ICurrentUser>({
    title: 'Current user',
    endpoint: `${config.url.AUTH}auth`,
    request
  });
}

export async function getProfile(request?: IFrontRequest) {
  await AxiosGet<IUserProfile>({
    title: 'Current user profile',
    endpoint: `${config.url.AUTH}profile`,
    request
  });
}

export async function postLogout(request?: IFrontRequest) {
  await AxiosPost({
    title: 'Logout',
    endpoint: `${config.url.AUTH}logout`,
    request
  });
};

export async function postSignup(request?: IFrontRequest) {
  await AxiosPost({
    title: 'Register user',
    endpoint: `${config.url.AUTH}signup`,
    request
  });
}

export async function getActiveUsers(request?: IFrontRequest) {
  await AxiosGet<IUserInfo>({
    title: 'Active users list',
    endpoint: `${config.url.AUTH}active-users`,
    request
  });
}

export async function getRSForms(filter: RSFormsFilter, request?: IFrontRequest) {
  let endpoint: string = ''
  if (filter.type === FilterType.PERSONAL) {
    endpoint = `${config.url.BASE}rsforms?owner=${filter.data as number}`
  } else {
    endpoint = `${config.url.BASE}rsforms?is_common=true`
  }

  await AxiosGet<IRSForm[]>({
    title: 'RSForms list',
    endpoint,
    request
  });
}

export async function postNewRSForm(request?: IFrontRequest) {
  await AxiosPost({
    title: 'New RSForm',
    endpoint: `${config.url.BASE}rsforms/create-detailed/`,
    request
  });
}

export async function getRSFormDetails(target: string, request?: IFrontRequest) {
  await AxiosGet<IRSForm>({
    title: `RSForm details for id=${target}`,
    endpoint: `${config.url.BASE}rsforms/${target}/details/`,
    request
  });
}

export async function patchRSForm(target: string, request?: IFrontRequest) {
  await AxiosPatch({
    title: `RSForm id=${target}`,
    endpoint: `${config.url.BASE}rsforms/${target}/`,
    request
  });
}

export async function patchConstituenta(target: string, request?: IFrontRequest) {
  await AxiosPatch({
    title: `Constituenta id=${target}`,
    endpoint: `${config.url.BASE}constituents/${target}/`,
    request
  });
}

export async function deleteRSForm(target: string, request?: IFrontRequest) {
  await AxiosDelete({
    title: `RSForm id=${target}`,
    endpoint: `${config.url.BASE}rsforms/${target}/`,
    request
  });
}

export async function getTRSFile(target: string, request?: IFrontRequest) {
  await AxiosGetBlob({
    title: `RSForm TRS file for id=${target}`,
    endpoint: `${config.url.BASE}rsforms/${target}/export-trs/`,
    request
  });
}

export async function postClaimRSForm(target: string, request?: IFrontRequest) {
  await AxiosPost({
    title: `Claim on RSForm id=${target}`,
    endpoint: `${config.url.BASE}rsforms/${target}/claim/`,
    request
  });
}

export async function postCheckExpression(schema: string, request?: IFrontRequest) {
  await AxiosPost({
    title: `Check expression for RSForm id=${schema}: ${request?.data.expression as string}`,
    endpoint: `${config.url.BASE}rsforms/${schema}/check/`,
    request
  });
}

export async function postNewConstituenta(schema: string, request?: IFrontRequest) {
  await AxiosPost({
    title: `New Constituenta for RSForm id=${schema}: ${request?.data.alias as string}`,
    endpoint: `${config.url.BASE}rsforms/${schema}/cst-create/`,
    request
  });
}

export async function patchDeleteConstituenta(schema: string, request?: IFrontRequest) {
  await AxiosPatch<IRSForm>({
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    title: `Delete Constituents for RSForm id=${schema}: ${request?.data.items.toString()}`,
    endpoint: `${config.url.BASE}rsforms/${schema}/cst-multidelete/`,
    request
  });
}

export async function patchMoveConstituenta(schema: string, request?: IFrontRequest) {
  await AxiosPatch<IRSForm>({
    title: `Moving Constituents for RSForm id=${schema}: ${JSON.stringify(request?.data.items)} to ${request?.data.move_to as number}`,
    endpoint: `${config.url.BASE}rsforms/${schema}/cst-moveto/`,
    request
  });
}

// ====== Helper functions ===========
async function AxiosGet<ReturnType>({ endpoint, request, title }: IAxiosRequest) {
  if (title) console.log(`[[${title}]] requested`);
  if (request?.setLoading) request?.setLoading(true);
  axios.get<ReturnType>(endpoint)
    .then((response) => {
      if (request?.setLoading) request?.setLoading(false);
      if (request?.onSuccess) request.onSuccess(response);
    })
    .catch((error) => {
      if (request?.setLoading) request?.setLoading(false);
      if (request?.showError) toast.error(error.message);
      if (request?.onError) request.onError(error);
    });
}

async function AxiosGetBlob({ endpoint, request, title }: IAxiosRequest) {
  if (title) console.log(`[[${title}]] requested`);
  if (request?.setLoading) request?.setLoading(true);
  axios.get(endpoint, { responseType: 'blob' })
    .then((response) => {
      if (request?.setLoading) request?.setLoading(false);
      if (request?.onSuccess) request.onSuccess(response);
    })
    .catch((error) => {
      if (request?.setLoading) request?.setLoading(false);
      if (request?.showError) toast.error(error.message);
      if (request?.onError) request.onError(error);
    });
}

async function AxiosPost({ endpoint, request, title }: IAxiosRequest) {
  if (title) console.log(`[[${title}]] posted`);
  if (request?.setLoading) request?.setLoading(true);
  axios.post(endpoint, request?.data)
    .then((response) => {
      if (request?.setLoading) request?.setLoading(false);
      if (request?.onSuccess) request.onSuccess(response);
    })
    .catch((error) => {
      if (request?.setLoading) request?.setLoading(false);
      if (request?.showError) toast.error(error.message);
      if (request?.onError) request.onError(error);
    });
}

async function AxiosDelete({ endpoint, request, title }: IAxiosRequest) {
  if (title) console.log(`[[${title}]] is being deleted`);
  if (request?.setLoading) request?.setLoading(true);
  axios.delete(endpoint)
    .then((response) => {
      if (request?.setLoading) request?.setLoading(false);
      if (request?.onSuccess) request.onSuccess(response);
    })
    .catch((error) => {
      if (request?.setLoading) request?.setLoading(false);
      if (request?.showError) toast.error(error.message);
      if (request?.onError) request.onError(error);
    });
}

async function AxiosPatch<ReturnType>({ endpoint, request, title }: IAxiosRequest) {
  if (title) console.log(`[[${title}]] is being patrially updated`);
  if (request?.setLoading) request?.setLoading(true);
  axios.patch<ReturnType>(endpoint, request?.data)
    .then((response) => {
      if (request?.setLoading) request?.setLoading(false);
      if (request?.onSuccess) request.onSuccess(response);
      return response.data;
    })
    .catch((error) => {
      if (request?.setLoading) request?.setLoading(false);
      if (request?.showError) toast.error(error.message);
      if (request?.onError) request.onError(error);
    });
}
