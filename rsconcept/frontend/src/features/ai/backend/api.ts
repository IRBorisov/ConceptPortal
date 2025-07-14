import { queryOptions } from '@tanstack/react-query';

import { axiosDelete, axiosGet, axiosPatch, axiosPost } from '@/backend/api-transport';
import { DELAYS, KEYS } from '@/backend/configuration';
import { infoMsg } from '@/utils/labels';

import {
  type ICreatePromptTemplateDTO,
  type IPromptTemplateDTO,
  type IPromptTemplateListDTO,
  type IUpdatePromptTemplateDTO,
  schemaPromptTemplate,
  schemaPromptTemplateList
} from './types';

export const promptsApi = {
  baseKey: KEYS.prompts,

  getAvailableTemplatesQueryOptions: () =>
    queryOptions({
      queryKey: [KEYS.prompts, 'available'] as const,
      staleTime: DELAYS.staleShort,
      queryFn: meta =>
        axiosGet<IPromptTemplateListDTO>({
          schema: schemaPromptTemplateList,
          endpoint: '/api/prompts/available/',
          options: { signal: meta.signal }
        })
    }),

  getPromptTemplateQueryOptions: (id: number) =>
    queryOptions({
      queryKey: [KEYS.prompts, id],
      staleTime: DELAYS.staleShort,
      queryFn: meta =>
        axiosGet<IPromptTemplateDTO>({
          schema: schemaPromptTemplate,
          endpoint: `/api/prompts/${id}/`,
          options: { signal: meta.signal }
        })
    }),

  createPromptTemplate: (data: ICreatePromptTemplateDTO) =>
    axiosPost<ICreatePromptTemplateDTO, IPromptTemplateDTO>({
      schema: schemaPromptTemplate,
      endpoint: '/api/prompts/',
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),

  updatePromptTemplate: (id: number, data: IUpdatePromptTemplateDTO) =>
    axiosPatch<IUpdatePromptTemplateDTO, IPromptTemplateDTO>({
      schema: schemaPromptTemplate,
      endpoint: `/api/prompts/${id}/`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),

  deletePromptTemplate: (id: number) =>
    axiosDelete({
      endpoint: `/api/prompts/${id}/`,
      request: {
        successMessage: infoMsg.changesSaved
      }
    })
} as const;
