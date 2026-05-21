/**
 * Module: generic API for backend REST communications using axios library.
 */
import { toast } from 'react-toastify';
import axios, { type AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { type z, ZodError } from 'zod';

import { globalTx } from '@/i18n';

import { buildConstants } from '@/utils/build-constants';
import { PARAMETER } from '@/utils/constants';
import { type RO } from '@/utils/meta';
import { extractErrorMessage } from '@/utils/utils';

import {
  cacheCsrfFromAuth,
  CSRF_CLIENT_MISSING,
  getCsrfToken,
  isCsrfAxiosFailure,
  refreshCsrfToken
} from './csrf-token';

export { isCsrfAxiosFailure } from './csrf-token';
export { AxiosError } from 'axios';
export const isAxiosError = axios.isAxiosError;

const CSRF_AUTH_ENDPOINT = '/users/api/auth';

const defaultOptions = {
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'x-csrftoken',
  baseURL: `${buildConstants.backend}`,
  withCredentials: true
};

const SAFE_HTTP_METHODS = new Set(['get', 'head', 'options']);

interface CsrfAwareAxiosRequestConfig extends InternalAxiosRequestConfig {
  _csrfRetried?: boolean;
}

const axiosInstance = axios.create(defaultOptions);

function attachCsrfHeader(config: InternalAxiosRequestConfig, token: string): void {
  config.headers['x-csrftoken'] = token;
}

function fetchCsrfAuth(): Promise<unknown> {
  return axiosInstance.get(CSRF_AUTH_ENDPOINT).then(response => {
    cacheCsrfFromAuth(response.data);
    return response.data as unknown;
  });
}

function csrfMissingError(): Error {
  return new Error(globalTx('tx.shell.error.csrfLost'), { cause: CSRF_CLIENT_MISSING });
}

axiosInstance.interceptors.request.use(async config => {
  const method = (config.method ?? 'get').toLowerCase();
  if (SAFE_HTTP_METHODS.has(method)) {
    return config;
  }

  let token = getCsrfToken();
  if (!token) {
    token = await refreshCsrfToken(fetchCsrfAuth);
  }
  if (!token) {
    return Promise.reject(csrfMissingError());
  }

  attachCsrfHeader(config, token);
  return config;
});

axiosInstance.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const config = error.config as CsrfAwareAxiosRequestConfig | undefined;
    if (!config || config._csrfRetried || !isCsrfAxiosFailure(error)) {
      return Promise.reject(error);
    }

    const token = await refreshCsrfToken(fetchCsrfAuth, { resetCookie: true });
    if (!token) {
      return Promise.reject(error);
    }

    config._csrfRetried = true;
    attachCsrfHeader(config, token);
    return axiosInstance.request(config);
  }
);

// ================ Data transfer types ================
interface IFrontRequest<RequestData, ResponseData> {
  data?: RequestData;
  successMessage?: string | ((data: ResponseData) => string);
}

interface IAxiosRequest<RequestData, ResponseData> {
  endpoint: string;
  request?: IFrontRequest<RequestData, ResponseData>;
  options?: AxiosRequestConfig;
  schema?: z.ZodType;
}

interface IAxiosGetRequest {
  endpoint: string;
  options?: AxiosRequestConfig;
  signal?: AbortSignal;
  schema?: z.ZodType;
}

// ================ Transport API calls ================
export function axiosGet<ResponseData>({ endpoint, options, schema }: IAxiosGetRequest) {
  return axiosInstance
    .get<ResponseData>(endpoint, options)
    .then(response => {
      schema?.parse(response.data);
      return response.data as RO<ResponseData>;
    })
    .catch((error: Error | AxiosError) => {
      // Note: Ignore cancellation errors
      if (error.name !== 'CanceledError') {
        notifyError(error);
        console.error(error);
      }
      throw error;
    });
}

export function axiosPost<RequestData, ResponseData = void>({
  endpoint,
  request,
  options,
  schema
}: IAxiosRequest<RequestData, ResponseData>) {
  return axiosInstance
    .post<ResponseData>(endpoint, request?.data, options)
    .then(response => {
      schema?.parse(response.data);
      notifySuccess(response.data, request?.successMessage);
      return response.data as RO<ResponseData>;
    })
    .catch((error: Error | AxiosError | ZodError) => {
      notifyError(error);
      throw error;
    });
}

export function axiosDelete<RequestData, ResponseData = void>({
  endpoint,
  request,
  options,
  schema
}: IAxiosRequest<RequestData, ResponseData>) {
  return axiosInstance
    .delete<ResponseData>(endpoint, options)
    .then(response => {
      schema?.parse(response.data);
      notifySuccess(response.data, request?.successMessage);
      return response.data as RO<ResponseData>;
    })
    .catch((error: Error | AxiosError | ZodError) => {
      notifyError(error);
      throw error;
    });
}

export function axiosPatch<RequestData, ResponseData = void>({
  endpoint,
  request,
  options,
  schema
}: IAxiosRequest<RequestData, ResponseData>) {
  return axiosInstance
    .patch<ResponseData>(endpoint, request?.data, options)
    .then(response => {
      schema?.parse(response.data);
      notifySuccess(response.data, request?.successMessage);
      return response.data as RO<ResponseData>;
    })
    .catch((error: Error | AxiosError | ZodError) => {
      notifyError(error);
      throw error;
    });
}

// ====== Internals =========
function notifySuccess<ResponseData>(
  data: ResponseData,
  message: string | ((data: ResponseData) => string) | undefined
) {
  if (!message) {
    return;
  }
  setTimeout(function notifySuccessWithDelay() {
    if (typeof message === 'string') {
      toast.success(message);
    } else {
      toast.success(message(data));
    }
  }, PARAMETER.notificationDelay);
}

function notifyError(error: Error | AxiosError | ZodError) {
  if (error instanceof ZodError) {
    toast.error(globalTx('tx.shell.error.invalidResponse'));
  } else {
    toast.error(extractErrorMessage(error));
  }
}
