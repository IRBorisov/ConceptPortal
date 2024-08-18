/**
 * Module: generic API for backend REST communications.
 */
import { AxiosError, AxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';

import { ErrorData } from '@/components/info/InfoError';
import { extractErrorMessage } from '@/utils/utils';

import { axiosInstance } from './apiConfiguration';

// ================ Data transfer types ================
export type DataCallback<ResponseData = undefined> = (data: ResponseData) => void;

export interface IFrontRequest<RequestData, ResponseData> {
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

export interface IAxiosRequest<RequestData, ResponseData> {
  endpoint: string;
  request: IFrontRequest<RequestData, ResponseData>;
  options?: AxiosRequestConfig;
}

// ================ Transport API calls ================
export function AxiosGet<ResponseData>({ endpoint, request, options }: IAxiosRequest<undefined, ResponseData>) {
  if (request.setLoading) request.setLoading(true);
  axiosInstance
    .get<ResponseData>(endpoint, options)
    .then(response => {
      if (request.setLoading) request.setLoading(false);
      if (request.onSuccess) request.onSuccess(response.data);
    })
    .catch((error: Error | AxiosError) => {
      if (request.setLoading) request.setLoading(false);
      if (request.showError) toast.error(extractErrorMessage(error));
      if (request.onError) request.onError(error);
    });
}

export function AxiosPost<RequestData, ResponseData>({
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
      if (request.showError) toast.error(extractErrorMessage(error));
      if (request.onError) request.onError(error);
    });
}

export function AxiosDelete<RequestData, ResponseData>({
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
      if (request.showError) toast.error(extractErrorMessage(error));
      if (request.onError) request.onError(error);
    });
}

export function AxiosPatch<RequestData, ResponseData>({
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
      if (request.showError) toast.error(extractErrorMessage(error));
      if (request.onError) request.onError(error);
    });
}
