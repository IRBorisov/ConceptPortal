import { queryOptions } from '@tanstack/react-query';

import { globalTx } from '@/i18n';
import { type AccessPolicy, type LibraryItem } from '@rsconcept/domain/library';

import {
  type RSFormDTO,
  schemaRSForm,
  schemaVersionCreatedResponse,
  type VersionCreatedResponse
} from '@/features/rsform';

import { axiosDelete, axiosGet, axiosPatch, axiosPost } from '@/backend/api-transport';
import { DELAYS, KEYS } from '@/backend/configuration';

import { type LibraryContextSearchField } from '../models/library-context-search';

import {
  type CloneLibraryItemDTO,
  type CreateLibraryItemDTO,
  type CreateRSFormFromSandboxDTO,
  type CreateRSModelFromSandboxDTO,
  type CreateVersionDTO,
  type RenameLocationDTO,
  schemaContextSearchResponse,
  schemaLibraryItem,
  schemaLibraryItemArray,
  schemaVersionExInfo,
  type UpdateLibraryItemDTO,
  type UpdateVersionDTO,
  type VersionInfoDTO
} from './types';

export const libraryApi = {
  baseKey: KEYS.library,
  libraryListKey: KEYS.composite.libraryList,
  contextSearchKey: [KEYS.library, 'context-search'] as const,

  getLibraryQueryOptions: ({ isAdmin }: { isAdmin: boolean }) =>
    queryOptions({
      queryKey: [...libraryApi.libraryListKey, isAdmin ? 'admin' : 'user'],
      staleTime: DELAYS.staleMedium,
      queryFn: meta =>
        axiosGet<LibraryItem[]>({
          schema: schemaLibraryItemArray,
          endpoint: isAdmin ? '/api/library/all' : '/api/library/active',
          options: { signal: meta.signal }
        })
    }),
  getTemplatesQueryOptions: () =>
    queryOptions({
      queryKey: [libraryApi.baseKey, 'templates'],
      staleTime: DELAYS.staleMedium,
      queryFn: meta =>
        axiosGet<LibraryItem[]>({
          schema: schemaLibraryItemArray,
          endpoint: '/api/library/templates',
          options: { signal: meta.signal }
        })
    }),
  contextSearch: ({
    query,
    fields,
    isAdmin,
    signal
  }: {
    query: string;
    fields: LibraryContextSearchField[];
    isAdmin: boolean;
    signal?: AbortSignal;
  }) =>
    axiosGet<{ ids: number[] }>({
      schema: schemaContextSearchResponse,
      endpoint: '/api/library/context-search',
      options: {
        signal,
        params: {
          q: query,
          search_fields: fields.join(','),
          ...(isAdmin ? { admin: '1' } : {})
        }
      }
    }),

  createItem: (data: CreateLibraryItemDTO) =>
    axiosPost<CreateLibraryItemDTO, LibraryItem>({
      schema: schemaLibraryItem,
      endpoint: '/api/library',
      request: {
        data: data,
        successMessage: globalTx('tx.lib.item.create.success')
      }
    }),
  createRSFormFromSandbox: (data: CreateRSFormFromSandboxDTO) =>
    axiosPost<CreateRSFormFromSandboxDTO, LibraryItem>({
      schema: schemaLibraryItem,
      endpoint: '/api/rsforms/create-from-sandbox',
      request: {
        data,
        successMessage: globalTx('tx.lib.item.create.success')
      }
    }),
  createRSModelFromSandbox: (data: CreateRSModelFromSandboxDTO) =>
    axiosPost<CreateRSModelFromSandboxDTO, LibraryItem>({
      schema: schemaLibraryItem,
      endpoint: '/api/models/create-from-sandbox',
      request: {
        data,
        successMessage: globalTx('tx.lib.item.create.success')
      }
    }),
  updateItem: (data: UpdateLibraryItemDTO) =>
    axiosPatch<UpdateLibraryItemDTO, LibraryItem>({
      schema: schemaLibraryItem,
      endpoint: `/api/library/${data.id}`,
      request: {
        data: data,
        successMessage: globalTx('tx.general.changes.save.success')
      }
    }),
  setOwner: ({ itemID, owner }: { itemID: number; owner: number }) =>
    axiosPatch({
      endpoint: `/api/library/${itemID}/set-owner`,
      request: {
        data: { user: owner },
        successMessage: globalTx('tx.general.changes.save.success')
      }
    }),
  setLocation: ({ itemID, location }: { itemID: number; location: string }) =>
    axiosPatch({
      endpoint: `/api/library/${itemID}/set-location`,
      request: {
        data: { location: location },
        successMessage: globalTx('tx.lib.location.edit.success')
      }
    }),
  setAccessPolicy: ({ itemID, policy }: { itemID: number; policy: AccessPolicy }) =>
    axiosPatch({
      endpoint: `/api/library/${itemID}/set-access-policy`,
      request: {
        data: { access_policy: policy },
        successMessage: globalTx('tx.general.changes.save.success')
      }
    }),
  setEditors: ({ itemID, editors }: { itemID: number; editors: number[] }) =>
    axiosPatch({
      endpoint: `/api/library/${itemID}/set-editors`,
      request: {
        data: { users: editors },
        successMessage: globalTx('tx.general.changes.save.success')
      }
    }),

  deleteItem: (data: { target: number; beforeInvalidate?: () => void | Promise<void> }) =>
    axiosDelete({
      endpoint: `/api/library/${data.target}`,
      request: {
        successMessage: globalTx('tx.general.delete.success')
      }
    }),
  cloneItem: ({ itemID, data }: { itemID: number; data: CloneLibraryItemDTO }) =>
    axiosPost<CloneLibraryItemDTO, LibraryItem>({
      schema: schemaLibraryItem,
      endpoint: `/api/library/${itemID}/clone`,
      request: {
        data: data,
        successMessage: newSchema => globalTx('tx.general.clone.success', { alias: newSchema.alias })
      }
    }),
  renameLocation: (data: RenameLocationDTO) =>
    axiosPatch({
      endpoint: '/api/library/rename-location',
      request: {
        data: data,
        successMessage: globalTx('tx.general.changes.save.success')
      }
    }),

  createVersion: ({ itemID, data }: { itemID: number; data: CreateVersionDTO }) =>
    axiosPost<CreateVersionDTO, VersionCreatedResponse>({
      schema: schemaVersionCreatedResponse,
      endpoint: `/api/library/${itemID}/create-version`,
      request: {
        data: data,
        successMessage: globalTx('tx.lib.version.create.success', { version: data.version })
      }
    }),
  restoreVersion: ({ versionID }: { versionID: number }) =>
    axiosPatch<undefined, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/versions/${versionID}/restore`,
      request: {
        successMessage: globalTx('tx.lib.version.revert.success')
      }
    }),
  updateVersion: (data: { itemID: number; version: UpdateVersionDTO }) =>
    axiosPatch<UpdateVersionDTO, VersionInfoDTO>({
      schema: schemaVersionExInfo,
      endpoint: `/api/versions/${data.version.id}`,
      request: {
        data: data.version,
        successMessage: globalTx('tx.general.changes.save.success')
      }
    }),
  deleteVersion: (data: { itemID: number; versionID: number }) =>
    axiosDelete({
      endpoint: `/api/versions/${data.versionID}`,
      request: {
        successMessage: globalTx('tx.general.delete.success')
      }
    })
} as const;
