/**
 * Module: generic API for backend REST communications using axios library.
 */
import axios from 'axios';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';

import { buildConstants } from '@/utils/buildConstants';
import { extractErrorMessage } from '@/utils/utils';

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

export interface IFrontRequest<RequestData, ResponseData> {
  data?: RequestData;
  successMessage?: string | ((data: ResponseData) => string);
}

export interface IAxiosRequest<RequestData, ResponseData> {
  endpoint: string;
  request?: IFrontRequest<RequestData, ResponseData>;
  options?: AxiosRequestConfig;
}

export interface IAxiosGetRequest {
  endpoint: string;
  options?: AxiosRequestConfig;
  signal?: AbortSignal;
}

// ================ Transport API calls ================
export function axiosGet<ResponseData>({ endpoint, options }: IAxiosGetRequest) {
  return axiosInstance
    .get<ResponseData>(endpoint, options)
    .then(response => response.data)
    .catch((error: Error | AxiosError) => {
      toast.error(extractErrorMessage(error));
      console.error(error);
      throw error;
    });
}

export function axiosPost<RequestData, ResponseData = void>({
  endpoint,
  request,
  options
}: IAxiosRequest<RequestData, ResponseData>) {
  return axiosInstance
    .post<ResponseData>(endpoint, request?.data, options)
    .then(response => {
      if (request?.successMessage) {
        if (typeof request.successMessage === 'string') {
          toast.success(request.successMessage);
        } else {
          toast.success(request.successMessage(response.data));
        }
      }
      return response.data;
    })
    .catch((error: Error | AxiosError) => {
      toast.error(extractErrorMessage(error));
      console.error(error);
      throw error;
    });
}

export function axiosDelete<RequestData, ResponseData = void>({
  endpoint,
  request,
  options
}: IAxiosRequest<RequestData, ResponseData>) {
  return axiosInstance
    .delete<ResponseData>(endpoint, options)
    .then(response => {
      if (request?.successMessage) {
        if (typeof request.successMessage === 'string') {
          toast.success(request.successMessage);
        } else {
          toast.success(request.successMessage(response.data));
        }
      }
      return response.data;
    })
    .catch((error: Error | AxiosError) => {
      toast.error(extractErrorMessage(error));
      console.error(error);
      throw error;
    });
}

export function axiosPatch<RequestData, ResponseData = void>({
  endpoint,
  request,
  options
}: IAxiosRequest<RequestData, ResponseData>) {
  return axiosInstance
    .patch<ResponseData>(endpoint, request?.data, options)
    .then(response => {
      if (request?.successMessage) {
        if (typeof request.successMessage === 'string') {
          toast.success(request.successMessage);
        } else {
          toast.success(request.successMessage(response.data));
        }
      }
      return response.data;
    })
    .catch((error: Error | AxiosError) => {
      toast.error(extractErrorMessage(error));
      console.error(error);
      throw error;
    });
}
