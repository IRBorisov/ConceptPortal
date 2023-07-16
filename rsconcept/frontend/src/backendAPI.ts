import axios, { AxiosResponse } from 'axios'
import { config } from './constants'
import { ErrorInfo } from './components/BackendError'
import { toast } from 'react-toastify'
import { ICurrentUser, IRSForm, IUserInfo, IUserProfile } from './models'
import { FilterType, RSFormsFilter } from './hooks/useRSForms'

export type BackendCallback = (response: AxiosResponse) => void;

export interface IFrontRequest {
  onSucccess?: BackendCallback
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
  AxiosPost({
    title: 'Login',
    endpoint: `${config.url.AUTH}login`,
    request: request
  });
}

export async function getAuth(request?: IFrontRequest) {
  AxiosGet<ICurrentUser>({
    title: 'Current user',
    endpoint: `${config.url.AUTH}auth`,
    request: request
  });
}

export async function getProfile(request?: IFrontRequest) {
  AxiosGet<IUserProfile>({
    title: 'Current user profile',
    endpoint: `${config.url.AUTH}profile`,
    request: request
  });
}

export async function postLogout(request?: IFrontRequest) {
  AxiosPost({
    title: 'Logout',
    endpoint: `${config.url.AUTH}logout`,
    request: request
  });
};

export async function postSignup(request?: IFrontRequest) {
  AxiosPost({
    title: 'Register user',
    endpoint: `${config.url.AUTH}signup`,
    request: request
  });
}

export async function getActiveUsers(request?: IFrontRequest) {
  AxiosGet<IUserInfo>({
    title: 'Active users list',
    endpoint: `${config.url.AUTH}active-users`,
    request: request
  });
}

export async function getRSForms(filter: RSFormsFilter, request?: IFrontRequest) {
  let endpoint: string = ''
  if (filter.type === FilterType.PERSONAL) {
    endpoint = `${config.url.BASE}rsforms?owner=${filter.data!}`
  } else {
    endpoint = `${config.url.BASE}rsforms?is_common=true`
  }

  AxiosGet<IRSForm[]>({
    title: `RSForms list`,
    endpoint: endpoint,
    request: request
  });
}

export async function postNewRSForm(request?: IFrontRequest) {
  AxiosPost({
    title: `New RSForm`,
    endpoint: `${config.url.BASE}rsforms/create-detailed/`,
    request: request
  });
}

export async function getRSFormDetails(target: string, request?: IFrontRequest) {
  AxiosGet<IRSForm>({
    title: `RSForm details for id=${target}`,
    endpoint: `${config.url.BASE}rsforms/${target}/details/`,
    request: request
  });
}

export async function patchRSForm(target: string, request?: IFrontRequest) {
  AxiosPatch({
    title: `RSForm id=${target}`,
    endpoint: `${config.url.BASE}rsforms/${target}/`,
    request: request
  });
}

export async function deleteRSForm(target: string, request?: IFrontRequest) {
  AxiosDelete({
    title: `RSForm id=${target}`,
    endpoint: `${config.url.BASE}rsforms/${target}/`,
    request: request
  });
}

export async function postClaimRSForm(target: string, request?: IFrontRequest) {
  AxiosPost({
    title: `Claim on RSForm id=${target}`,
    endpoint: `${config.url.BASE}rsforms/${target}/claim/`,
    request: request
  });
}

// ====== Helper functions ===========
function AxiosGet<ReturnType>({endpoint, request, title}: IAxiosRequest) {
  if (title) console.log(`[[${title}]] requested`);
  if (request?.setLoading) request?.setLoading(true);
  axios.get<ReturnType>(endpoint)
  .then(function (response) {
    if (request?.setLoading) request?.setLoading(false);
    if (request?.onSucccess) request.onSucccess(response);
  })
  .catch(function (error) {
    if (request?.setLoading) request?.setLoading(false);
    if (request?.showError) toast.error(error.message);
    if (request?.onError) request.onError(error);
  });
}

function AxiosPost({endpoint, request, title}: IAxiosRequest) {
  if (title) console.log(`[[${title}]] posted`);
  if (request?.setLoading) request?.setLoading(true);
  axios.post(endpoint, request?.data)
  .then(function (response) {
    if (request?.setLoading) request?.setLoading(false);
    if (request?.onSucccess) request.onSucccess(response);
  })
  .catch(function (error) {
    if (request?.setLoading) request?.setLoading(false);
    if (request?.showError) toast.error(error.message);
    if (request?.onError) request.onError(error);
  });
}

function AxiosDelete({endpoint, request, title}: IAxiosRequest) {
  if (title) console.log(`[[${title}]] is being deleted`);
  if (request?.setLoading) request?.setLoading(true);
  axios.delete(endpoint)
  .then(function (response) {
    if (request?.setLoading) request?.setLoading(false);
    if (request?.onSucccess) request.onSucccess(response);
  })
  .catch(function (error) {
    if (request?.setLoading) request?.setLoading(false);
    if (request?.showError) toast.error(error.message);
    if (request?.onError) request.onError(error);
  });
}

function AxiosPatch({endpoint, request, title}: IAxiosRequest) {
  if (title) console.log(`[[${title}]] is being patrially updated`);
  if (request?.setLoading) request?.setLoading(true);
  axios.patch(endpoint, request?.data)
  .then(function (response) {
    if (request?.setLoading) request?.setLoading(false);
    if (request?.onSucccess) request.onSucccess(response);
  })
  .catch(function (error) {
    if (request?.setLoading) request?.setLoading(false);
    if (request?.showError) toast.error(error.message);
    if (request?.onError) request.onError(error);
  });
}