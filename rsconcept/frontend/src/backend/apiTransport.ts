/**
 * Module: generic API for backend REST communications using axios library.
 */
import { toast } from 'react-toastify';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { z, ZodError } from 'zod';

import { buildConstants } from '@/utils/buildConstants';
import { errorMsg } from '@/utils/labels';
import { extractErrorMessage } from '@/utils/utils';

export { AxiosError } from 'axios';
export const isAxiosError = axios.isAxiosError;

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
export interface IFrontRequest<RequestData, ResponseData> {
  data?: RequestData;
  successMessage?: string | ((data: ResponseData) => string);
}

export interface IAxiosRequest<RequestData, ResponseData> {
  endpoint: string;
  request?: IFrontRequest<RequestData, ResponseData>;
  options?: AxiosRequestConfig;
  schema?: z.ZodType;
}

export interface IAxiosGetRequest {
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
      return response.data;
    })
    .catch((error: Error | AxiosError) => {
      // Note: Ignore cancellation errors
      if (error.name !== 'CanceledError') {
        if (error instanceof ZodError) {
          toast.error(errorMsg.invalidResponse);
        } else {
          toast.error(extractErrorMessage(error));
        }
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
      if (request?.successMessage) {
        if (typeof request.successMessage === 'string') {
          toast.success(request.successMessage);
        } else {
          toast.success(request.successMessage(response.data));
        }
      }
      return response.data;
    })
    .catch((error: Error | AxiosError | ZodError) => {
      if (error instanceof ZodError) {
        toast.error(errorMsg.invalidResponse);
      } else {
        toast.error(extractErrorMessage(error));
      }
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
      if (request?.successMessage) {
        if (typeof request.successMessage === 'string') {
          toast.success(request.successMessage);
        } else {
          toast.success(request.successMessage(response.data));
        }
      }
      return response.data;
    })
    .catch((error: Error | AxiosError | ZodError) => {
      if (error instanceof ZodError) {
        toast.error(errorMsg.invalidResponse);
      } else {
        toast.error(extractErrorMessage(error));
      }
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
      if (request?.successMessage) {
        if (typeof request.successMessage === 'string') {
          toast.success(request.successMessage);
        } else {
          toast.success(request.successMessage(response.data));
        }
      }
      return response.data;
    })
    .catch((error: Error | AxiosError | ZodError) => {
      if (error instanceof ZodError) {
        toast.error(errorMsg.invalidResponse);
      } else {
        toast.error(extractErrorMessage(error));
      }
      throw error;
    });
}
