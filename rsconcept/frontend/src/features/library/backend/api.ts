import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';

import { axiosDelete, axiosGet, axiosPatch, axiosPost } from '@/backend/apiTransport';
import { DELAYS } from '@/backend/configuration';
import { ossApi } from '@/features/oss/backend/api';
import { IRSFormDTO, rsformsApi } from '@/features/rsform/backend/api';
import { UserID } from '@/features/users/models/user';
import { errorMsg, infoMsg } from '@/utils/labels';

import { AccessPolicy, ILibraryItem, IVersionInfo, LibraryItemID, LibraryItemType, VersionID } from '../models/library';
import { validateLocation } from '../models/libraryAPI';

/**
 * Represents update data for renaming Location.
 */
export interface IRenameLocationDTO {
  target: string;
  new_location: string;
}

/**
 * Represents data, used for cloning {@link IRSForm}.
 */
export const schemaCloneLibraryItem = z.object({
  id: z.number(),
  item_type: z.nativeEnum(LibraryItemType),
  title: z.string().nonempty(errorMsg.requiredField),
  alias: z.string().nonempty(errorMsg.requiredField),
  comment: z.string(),
  visible: z.boolean(),
  read_only: z.boolean(),
  location: z.string().refine(data => validateLocation(data), { message: errorMsg.invalidLocation }),
  access_policy: z.nativeEnum(AccessPolicy),

  items: z.array(z.number()).optional()
});

/**
 * Represents data, used for cloning {@link IRSForm}.
 */
export type ICloneLibraryItemDTO = z.infer<typeof schemaCloneLibraryItem>;

/**
 * Represents data, used for creating {@link IRSForm}.
 */
export const schemaCreateLibraryItem = z
  .object({
    item_type: z.nativeEnum(LibraryItemType),
    title: z.string().optional(),
    alias: z.string().optional(),
    comment: z.string(),
    visible: z.boolean(),
    read_only: z.boolean(),
    location: z.string().refine(data => validateLocation(data), { message: errorMsg.invalidLocation }),
    access_policy: z.nativeEnum(AccessPolicy),

    file: z.instanceof(File).optional(),
    fileName: z.string().optional()
  })
  .refine(data => !!data.file || !!data.title, {
    path: ['title'],
    message: errorMsg.requiredField
  })
  .refine(data => !!data.file || !!data.alias, {
    path: ['alias'],
    message: errorMsg.requiredField
  });

/**
 * Represents data, used for creating {@link IRSForm}.
 */
export type ICreateLibraryItemDTO = z.infer<typeof schemaCreateLibraryItem>;

/**
 * Represents update data for editing {@link ILibraryItem}.
 */
export const schemaUpdateLibraryItem = z.object({
  id: z.number(),
  item_type: z.nativeEnum(LibraryItemType),
  title: z.string().nonempty(errorMsg.requiredField),
  alias: z.string().nonempty(errorMsg.requiredField),
  comment: z.string(),
  visible: z.boolean(),
  read_only: z.boolean()
});

/**
 * Represents update data for editing {@link ILibraryItem}.
 */
export type IUpdateLibraryItemDTO = z.infer<typeof schemaUpdateLibraryItem>;

/**
 * Create version metadata in persistent storage.
 */
export const schemaVersionCreate = z.object({
  version: z.string(),
  description: z.string(),
  items: z.array(z.number()).optional()
});

/**
 * Create version metadata in persistent storage.
 */
export type IVersionCreateDTO = z.infer<typeof schemaVersionCreate>;

/**
 * Represents data response when creating {@link IVersionInfo}.
 */
export interface IVersionCreatedResponse {
  version: number;
  schema: IRSFormDTO;
}

/**
 * Represents version data, intended to update version metadata in persistent storage.
 */
export const schemaVersionUpdate = z.object({
  id: z.number(),
  version: z.string().nonempty(errorMsg.requiredField),
  description: z.string()
});

/**
 * Represents version data, intended to update version metadata in persistent storage.
 */
export type IVersionUpdateDTO = z.infer<typeof schemaVersionUpdate>;

export const libraryApi = {
  baseKey: 'library',
  libraryListKey: ['library', 'list'],

  getItemQueryOptions: ({ itemID, itemType }: { itemID: LibraryItemID; itemType: LibraryItemType }) => {
    return itemType === LibraryItemType.RSFORM
      ? rsformsApi.getRSFormQueryOptions({ itemID })
      : ossApi.getOssQueryOptions({ itemID });
  },
  getLibraryQueryOptions: ({ isAdmin }: { isAdmin: boolean }) =>
    queryOptions({
      queryKey: [...libraryApi.libraryListKey, isAdmin ? 'admin' : 'user'],
      staleTime: DELAYS.staleMedium,
      queryFn: meta =>
        axiosGet<ILibraryItem[]>({
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
          endpoint: '/api/library/templates',
          options: { signal: meta.signal }
        })
    }),

  createItem: (data: ICreateLibraryItemDTO) =>
    axiosPost<ICreateLibraryItemDTO, ILibraryItem>({
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
      endpoint: `/api/library/${data.id}`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  setOwner: ({ itemID, owner }: { itemID: LibraryItemID; owner: UserID }) =>
    axiosPatch({
      endpoint: `/api/library/${itemID}/set-owner`,
      request: {
        data: { user: owner },
        successMessage: infoMsg.changesSaved
      }
    }),
  setLocation: ({ itemID, location }: { itemID: LibraryItemID; location: string }) =>
    axiosPatch({
      endpoint: `/api/library/${itemID}/set-location`,
      request: {
        data: { location: location },
        successMessage: infoMsg.moveComplete
      }
    }),
  setAccessPolicy: ({ itemID, policy }: { itemID: LibraryItemID; policy: AccessPolicy }) =>
    axiosPatch({
      endpoint: `/api/library/${itemID}/set-access-policy`,
      request: {
        data: { access_policy: policy },
        successMessage: infoMsg.changesSaved
      }
    }),
  setEditors: ({ itemID, editors }: { itemID: LibraryItemID; editors: UserID[] }) =>
    axiosPatch({
      endpoint: `/api/library/${itemID}/set-editors`,
      request: {
        data: { users: editors },
        successMessage: infoMsg.changesSaved
      }
    }),

  deleteItem: (target: LibraryItemID) =>
    axiosDelete({
      endpoint: `/api/library/${target}`,
      request: {
        successMessage: infoMsg.itemDestroyed
      }
    }),
  cloneItem: (data: ICloneLibraryItemDTO) =>
    axiosPost<ICloneLibraryItemDTO, IRSFormDTO>({
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

  versionCreate: ({ itemID, data }: { itemID: LibraryItemID; data: IVersionCreateDTO }) =>
    axiosPost<IVersionCreateDTO, IVersionCreatedResponse>({
      endpoint: `/api/library/${itemID}/create-version`,
      request: {
        data: data,
        successMessage: infoMsg.newVersion(data.version)
      }
    }),
  versionRestore: ({ versionID }: { versionID: VersionID }) =>
    axiosPatch<undefined, IRSFormDTO>({
      endpoint: `/api/versions/${versionID}/restore`,
      request: {
        successMessage: infoMsg.versionRestored
      }
    }),
  versionUpdate: (data: IVersionUpdateDTO) =>
    axiosPatch<IVersionUpdateDTO, IVersionInfo>({
      endpoint: `/api/versions/${data.id}`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  versionDelete: (data: { itemID: LibraryItemID; versionID: VersionID }) =>
    axiosDelete({
      endpoint: `/api/versions/${data.versionID}`,
      request: {
        successMessage: infoMsg.versionDestroyed
      }
    })
};
