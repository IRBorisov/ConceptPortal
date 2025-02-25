import { queryOptions } from '@tanstack/react-query';

import {
  type IRSFormDTO,
  type IVersionCreatedResponse,
  schemaRSForm,
  schemaVersionCreatedResponse
} from '@/features/rsform';

import { axiosDelete, axiosGet, axiosPatch, axiosPost } from '@/backend/apiTransport';
import { DELAYS, KEYS } from '@/backend/configuration';
import { infoMsg } from '@/utils/labels';

import {
  type AccessPolicy,
  type ICloneLibraryItemDTO,
  type ICreateLibraryItemDTO,
  type ILibraryItem,
  type IRenameLocationDTO,
  type IUpdateLibraryItemDTO,
  type IVersionCreateDTO,
  type IVersionInfo,
  type IVersionUpdateDTO,
  schemaLibraryItem,
  schemaLibraryItemArray,
  schemaVersionInfo
} from './types';

export const libraryApi = {
  baseKey: KEYS.library,
  libraryListKey: KEYS.composite.libraryList,

  getLibraryQueryOptions: ({ isAdmin }: { isAdmin: boolean }) =>
    queryOptions({
      queryKey: [...libraryApi.libraryListKey, isAdmin ? 'admin' : 'user'],
      staleTime: DELAYS.staleMedium,
      queryFn: meta =>
        axiosGet<ILibraryItem[]>({
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
        axiosGet<ILibraryItem[]>({
          schema: schemaLibraryItemArray,
          endpoint: '/api/library/templates',
          options: { signal: meta.signal }
        })
    }),

  createItem: (data: ICreateLibraryItemDTO) =>
    axiosPost<ICreateLibraryItemDTO, ILibraryItem>({
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
  updateItem: (data: IUpdateLibraryItemDTO) =>
    axiosPatch<IUpdateLibraryItemDTO, ILibraryItem>({
      schema: schemaLibraryItem,
      endpoint: `/api/library/${data.id}`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  setOwner: ({ itemID, owner }: { itemID: number; owner: number }) =>
    axiosPatch({
      endpoint: `/api/library/${itemID}/set-owner`,
      request: {
        data: { user: owner },
        successMessage: infoMsg.changesSaved
      }
    }),
  setLocation: ({ itemID, location }: { itemID: number; location: string }) =>
    axiosPatch({
      endpoint: `/api/library/${itemID}/set-location`,
      request: {
        data: { location: location },
        successMessage: infoMsg.moveComplete
      }
    }),
  setAccessPolicy: ({ itemID, policy }: { itemID: number; policy: AccessPolicy }) =>
    axiosPatch({
      endpoint: `/api/library/${itemID}/set-access-policy`,
      request: {
        data: { access_policy: policy },
        successMessage: infoMsg.changesSaved
      }
    }),
  setEditors: ({ itemID, editors }: { itemID: number; editors: number[] }) =>
    axiosPatch({
      endpoint: `/api/library/${itemID}/set-editors`,
      request: {
        data: { users: editors },
        successMessage: infoMsg.changesSaved
      }
    }),

  deleteItem: (target: number) =>
    axiosDelete({
      endpoint: `/api/library/${target}`,
      request: {
        successMessage: infoMsg.itemDestroyed
      }
    }),
  cloneItem: (data: ICloneLibraryItemDTO) =>
    axiosPost<ICloneLibraryItemDTO, IRSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/library/${data.id}/clone`,
      request: {
        data: data,
        successMessage: newSchema => infoMsg.cloneComplete(newSchema.alias)
      }
    }),
  renameLocation: (data: IRenameLocationDTO) =>
    axiosPatch({
      endpoint: '/api/library/rename-location',
      request: {
        data: data,
        successMessage: infoMsg.locationRenamed
      }
    }),

  versionCreate: ({ itemID, data }: { itemID: number; data: IVersionCreateDTO }) =>
    axiosPost<IVersionCreateDTO, IVersionCreatedResponse>({
      schema: schemaVersionCreatedResponse,
      endpoint: `/api/library/${itemID}/create-version`,
      request: {
        data: data,
        successMessage: infoMsg.newVersion(data.version)
      }
    }),
  versionRestore: ({ versionID }: { versionID: number }) =>
    axiosPatch<undefined, IRSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/versions/${versionID}/restore`,
      request: {
        successMessage: infoMsg.versionRestored
      }
    }),
  versionUpdate: (data: { itemID: number; version: IVersionUpdateDTO }) =>
    axiosPatch<IVersionUpdateDTO, IVersionInfo>({
      schema: schemaVersionInfo,
      endpoint: `/api/versions/${data.version.id}`,
      request: {
        data: data.version,
        successMessage: infoMsg.changesSaved
      }
    }),
  versionDelete: (data: { itemID: number; versionID: number }) =>
    axiosDelete({
      endpoint: `/api/versions/${data.versionID}`,
      request: {
        successMessage: infoMsg.versionDestroyed
      }
    })
};
