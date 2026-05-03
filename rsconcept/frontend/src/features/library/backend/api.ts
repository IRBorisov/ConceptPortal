import { queryOptions } from '@tanstack/react-query';

import { type AccessPolicy, type LibraryItem } from '@/domain/library';
import { globalTx } from '@/i18n';

import {
  type RSFormDTO,
  schemaRSForm,
  schemaVersionCreatedResponse,
  type VersionCreatedResponse
} from '@/features/rsform';

import { axiosDelete, axiosGet, axiosPatch, axiosPost } from '@/backend/api-transport';
import { DELAYS, KEYS } from '@/backend/configuration';

import {
  type CloneLibraryItemDTO,
  type CreateLibraryItemDTO,
  type CreateRSFormFromSandboxDTO,
  type CreateRSModelFromSandboxDTO,
  type CreateVersionDTO,
  type RenameLocationDTO,
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

  createItem: (data: CreateLibraryItemDTO) =>
    axiosPost<CreateLibraryItemDTO, LibraryItem>({
      schema: schemaLibraryItem,
      endpoint: '/api/library',
      request: {
        data: data,
        successMessage: globalTx('labels.info.newLibraryItem')
      }
    }),
  createRSFormFromSandbox: (data: CreateRSFormFromSandboxDTO) =>
    axiosPost<CreateRSFormFromSandboxDTO, LibraryItem>({
      schema: schemaLibraryItem,
      endpoint: '/api/rsforms/create-from-sandbox',
      request: {
        data,
        successMessage: globalTx('labels.info.newLibraryItem')
      }
    }),
  createRSModelFromSandbox: (data: CreateRSModelFromSandboxDTO) =>
    axiosPost<CreateRSModelFromSandboxDTO, LibraryItem>({
      schema: schemaLibraryItem,
      endpoint: '/api/models/create-from-sandbox',
      request: {
        data,
        successMessage: globalTx('labels.info.newLibraryItem')
      }
    }),
  updateItem: (data: UpdateLibraryItemDTO) =>
    axiosPatch<UpdateLibraryItemDTO, LibraryItem>({
      schema: schemaLibraryItem,
      endpoint: `/api/library/${data.id}`,
      request: {
        data: data,
        successMessage: globalTx('labels.info.changesSaved')
      }
    }),
  setOwner: ({ itemID, owner }: { itemID: number; owner: number }) =>
    axiosPatch({
      endpoint: `/api/library/${itemID}/set-owner`,
      request: {
        data: { user: owner },
        successMessage: globalTx('labels.info.changesSaved')
      }
    }),
  setLocation: ({ itemID, location }: { itemID: number; location: string }) =>
    axiosPatch({
      endpoint: `/api/library/${itemID}/set-location`,
      request: {
        data: { location: location },
        successMessage: globalTx('labels.info.moveComplete')
      }
    }),
  setAccessPolicy: ({ itemID, policy }: { itemID: number; policy: AccessPolicy }) =>
    axiosPatch({
      endpoint: `/api/library/${itemID}/set-access-policy`,
      request: {
        data: { access_policy: policy },
        successMessage: globalTx('labels.info.changesSaved')
      }
    }),
  setEditors: ({ itemID, editors }: { itemID: number; editors: number[] }) =>
    axiosPatch({
      endpoint: `/api/library/${itemID}/set-editors`,
      request: {
        data: { users: editors },
        successMessage: globalTx('labels.info.changesSaved')
      }
    }),

  deleteItem: (data: { target: number; beforeInvalidate?: () => void | Promise<void> }) =>
    axiosDelete({
      endpoint: `/api/library/${data.target}`,
      request: {
        successMessage: globalTx('labels.info.itemDestroyed')
      }
    }),
  cloneItem: ({ itemID, data }: { itemID: number; data: CloneLibraryItemDTO }) =>
    axiosPost<CloneLibraryItemDTO, LibraryItem>({
      schema: schemaLibraryItem,
      endpoint: `/api/library/${itemID}/clone`,
      request: {
        data: data,
        successMessage: newSchema => globalTx('labels.info.cloneComplete', { alias: newSchema.alias })
      }
    }),
  renameLocation: (data: RenameLocationDTO) =>
    axiosPatch({
      endpoint: '/api/library/rename-location',
      request: {
        data: data,
        successMessage: globalTx('labels.info.locationRenamed')
      }
    }),

  createVersion: ({ itemID, data }: { itemID: number; data: CreateVersionDTO }) =>
    axiosPost<CreateVersionDTO, VersionCreatedResponse>({
      schema: schemaVersionCreatedResponse,
      endpoint: `/api/library/${itemID}/create-version`,
      request: {
        data: data,
        successMessage: globalTx('labels.info.newVersion', { version: data.version })
      }
    }),
  restoreVersion: ({ versionID }: { versionID: number }) =>
    axiosPatch<undefined, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/versions/${versionID}/restore`,
      request: {
        successMessage: globalTx('labels.info.versionRestored')
      }
    }),
  updateVersion: (data: { itemID: number; version: UpdateVersionDTO }) =>
    axiosPatch<UpdateVersionDTO, VersionInfoDTO>({
      schema: schemaVersionExInfo,
      endpoint: `/api/versions/${data.version.id}`,
      request: {
        data: data.version,
        successMessage: globalTx('labels.info.changesSaved')
      }
    }),
  deleteVersion: (data: { itemID: number; versionID: number }) =>
    axiosDelete({
      endpoint: `/api/versions/${data.versionID}`,
      request: {
        successMessage: globalTx('labels.info.versionDestroyed')
      }
    })
} as const;
