import { queryOptions } from '@tanstack/react-query';

import {
  type RSFormDTO,
  schemaRSForm,
  schemaVersionCreatedResponse,
  type VersionCreatedResponse
} from '@/features/rsform';

import { axiosDelete, axiosGet, axiosPatch, axiosPost } from '@/backend/api-transport';
import { DELAYS, KEYS } from '@/backend/configuration';
import { infoMsg } from '@/utils/labels';

import {
  type AccessPolicy,
  type CloneLibraryItemDTO,
  type CreateLibraryItemDTO,
  type CreateVersionDTO,
  type LibraryItem,
  type RenameLocationDTO,
  schemaLibraryItem,
  schemaLibraryItemArray,
  schemaVersionExInfo,
  type UpdateLibraryItemDTO,
  type UpdateVersionDTO,
  type VersionExInfo
} from './types';

export const libraryApi = {
  baseKey: KEYS.library,
  libraryListKey: KEYS.composite.libraryList,

  getLibraryQueryOptions: ({ isAdmin }: { isAdmin: boolean; }) =>
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
      endpoint: !data.file ? '/api/library' : '/api/rsforms/create-detailed',
      request: {
        data: data,
        successMessage: infoMsg.newLibraryItem
      },
      options: !data.file
        ? undefined
        : {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
    }),
  updateItem: (data: UpdateLibraryItemDTO) =>
    axiosPatch<UpdateLibraryItemDTO, LibraryItem>({
      schema: schemaLibraryItem,
      endpoint: `/api/library/${data.id}`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  setOwner: ({ itemID, owner }: { itemID: number; owner: number; }) =>
    axiosPatch({
      endpoint: `/api/library/${itemID}/set-owner`,
      request: {
        data: { user: owner },
        successMessage: infoMsg.changesSaved
      }
    }),
  setLocation: ({ itemID, location }: { itemID: number; location: string; }) =>
    axiosPatch({
      endpoint: `/api/library/${itemID}/set-location`,
      request: {
        data: { location: location },
        successMessage: infoMsg.moveComplete
      }
    }),
  setAccessPolicy: ({ itemID, policy }: { itemID: number; policy: AccessPolicy; }) =>
    axiosPatch({
      endpoint: `/api/library/${itemID}/set-access-policy`,
      request: {
        data: { access_policy: policy },
        successMessage: infoMsg.changesSaved
      }
    }),
  setEditors: ({ itemID, editors }: { itemID: number; editors: number[]; }) =>
    axiosPatch({
      endpoint: `/api/library/${itemID}/set-editors`,
      request: {
        data: { users: editors },
        successMessage: infoMsg.changesSaved
      }
    }),

  deleteItem: (data: { target: number; beforeInvalidate?: () => void | Promise<void>; }) =>
    axiosDelete({
      endpoint: `/api/library/${data.target}`,
      request: {
        successMessage: infoMsg.itemDestroyed
      }
    }),
  cloneItem: ({ itemID, data }: { itemID: number; data: CloneLibraryItemDTO; }) =>
    axiosPost<CloneLibraryItemDTO, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/library/${itemID}/clone`,
      request: {
        data: data,
        successMessage: newSchema => infoMsg.cloneComplete(newSchema.alias)
      }
    }),
  renameLocation: (data: RenameLocationDTO) =>
    axiosPatch({
      endpoint: '/api/library/rename-location',
      request: {
        data: data,
        successMessage: infoMsg.locationRenamed
      }
    }),

  createVersion: ({ itemID, data }: { itemID: number; data: CreateVersionDTO; }) =>
    axiosPost<CreateVersionDTO, VersionCreatedResponse>({
      schema: schemaVersionCreatedResponse,
      endpoint: `/api/library/${itemID}/create-version`,
      request: {
        data: data,
        successMessage: infoMsg.newVersion(data.version)
      }
    }),
  restoreVersion: ({ versionID }: { versionID: number; }) =>
    axiosPatch<undefined, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/versions/${versionID}/restore`,
      request: {
        successMessage: infoMsg.versionRestored
      }
    }),
  updateVersion: (data: { itemID: number; version: UpdateVersionDTO; }) =>
    axiosPatch<UpdateVersionDTO, VersionExInfo>({
      schema: schemaVersionExInfo,
      endpoint: `/api/versions/${data.version.id}`,
      request: {
        data: data.version,
        successMessage: infoMsg.changesSaved
      }
    }),
  deleteVersion: (data: { itemID: number; versionID: number; }) =>
    axiosDelete({
      endpoint: `/api/versions/${data.versionID}`,
      request: {
        successMessage: infoMsg.versionDestroyed
      }
    })
} as const;
