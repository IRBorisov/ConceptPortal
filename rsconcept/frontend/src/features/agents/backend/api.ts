import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';

import { globalTx } from '@/i18n';

import { axiosDelete, axiosGet, axiosPatch, axiosPost } from '@/backend/api-transport';
import { DELAYS, KEYS } from '@/backend/configuration';

import {
  schemaAgentActionLogList,
  schemaApiKey,
  schemaApiKeyCreated,
  type AgentActionLogListDTO,
  type ApiKeyCreatedDTO,
  type ApiKeyDTO,
  type CreateApiKeyDTO
} from './types';

export const agentsApi = {
  baseKey: KEYS.agents,

  getKeysQueryOptions: () =>
    queryOptions({
      queryKey: [agentsApi.baseKey, 'keys'],
      staleTime: DELAYS.staleShort,
      queryFn: meta =>
        axiosGet<ApiKeyDTO[]>({
          schema: z.array(schemaApiKey),
          endpoint: '/api/agents/keys',
          options: { signal: meta.signal }
        })
    }),

  getLogsQueryOptions: () =>
    queryOptions({
      queryKey: [agentsApi.baseKey, 'logs'],
      staleTime: DELAYS.staleShort,
      queryFn: meta =>
        axiosGet<AgentActionLogListDTO>({
          schema: schemaAgentActionLogList,
          endpoint: '/api/agents/logs',
          options: { signal: meta.signal }
        })
    }),

  createKey: (data: CreateApiKeyDTO) =>
    axiosPost<CreateApiKeyDTO, ApiKeyCreatedDTO>({
      schema: schemaApiKeyCreated,
      endpoint: '/api/agents/keys',
      request: {
        data,
        successMessage: globalTx('tx.agents.key.create.success')
      }
    }),

  renameKey: (id: number, data: CreateApiKeyDTO) =>
    axiosPatch<CreateApiKeyDTO, ApiKeyDTO>({
      schema: schemaApiKey,
      endpoint: `/api/agents/keys/${id}`,
      request: {
        data,
        successMessage: globalTx('tx.general.changes.save.success')
      }
    }),

  revokeKey: (id: number) =>
    axiosDelete({
      endpoint: `/api/agents/keys/${id}`,
      request: {
        successMessage: globalTx('tx.agents.key.revoke.success')
      }
    })
} as const;
