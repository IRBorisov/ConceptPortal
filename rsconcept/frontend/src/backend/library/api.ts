import { queryOptions } from '@tanstack/react-query';

import { axiosDelete, axiosGet, axiosPatch, axiosPost } from '@/backend/apiTransport';
import { DELAYS } from '@/backend/configuration';
import { ossApi } from '@/backend/oss/api';
import { rsformsApi } from '@/backend/rsform/api';
import {
  AccessPolicy,
  ILibraryItem,
  IVersionData,
  IVersionInfo,
  LibraryItemID,
  LibraryItemType,
  VersionID
} from '@/models/library';
import { ConstituentaID, IRSFormData } from '@/models/rsform';
import { UserID } from '@/models/user';
import { information } from '@/utils/labels';

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
export interface IRSFormCloneDTO extends Omit<ILibraryItem, 'time_create' | 'time_update' | 'owner'> {
  items?: ConstituentaID[];
}

/**
 * Represents data, used for creating {@link IRSForm}.
 */
export interface ILibraryCreateDTO extends Omit<ILibraryItem, 'time_create' | 'time_update' | 'id' | 'owner'> {
  file?: File;
  fileName?: string;
}

/**
 * Represents update data for editing {@link ILibraryItem}.
 */
export interface ILibraryUpdateDTO
  extends Omit<ILibraryItem, 'time_create' | 'time_update' | 'access_policy' | 'location' | 'owner'> {}

/**
 * Create version metadata in persistent storage.
 */
export interface IVersionCreateDTO {
  version: string;
  description: string;
  items?: ConstituentaID[];
}

/**
 * Represents data response when creating {@link IVersionInfo}.
 */
export interface IVersionCreatedResponse {
  version: number;
  schema: IRSFormData;
}

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
      queryKey: libraryApi.libraryListKey,
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

  createItem: (data: ILibraryCreateDTO) =>
    axiosPost<ILibraryCreateDTO, ILibraryItem>({
      endpoint: !data.file ? '/api/library' : '/api/rsforms/create-detailed',
      request: {
        data: data,
        successMessage: information.newLibraryItem
      },
      options: !data.file
        ? undefined
        : {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
    }),
  updateItem: (data: ILibraryUpdateDTO) =>
    axiosPatch<ILibraryUpdateDTO, ILibraryItem>({
      endpoint: `/api/library/${data.id}`,
      request: {
        data: data,
        successMessage: information.changesSaved
      }
    }),
  setOwner: ({ itemID, owner }: { itemID: LibraryItemID; owner: UserID }) =>
    axiosPatch({
      endpoint: `/api/library/${itemID}/set-owner`,
      request: {
        data: { user: owner },
        successMessage: information.changesSaved
      }
    }),
  setLocation: ({ itemID, location }: { itemID: LibraryItemID; location: string }) =>
    axiosPatch({
      endpoint: `/api/library/${itemID}/set-location`,
      request: {
        data: { location: location },
        successMessage: information.moveComplete
      }
    }),
  setAccessPolicy: ({ itemID, policy }: { itemID: LibraryItemID; policy: AccessPolicy }) =>
    axiosPatch({
      endpoint: `/api/library/${itemID}/set-access-policy`,
      request: {
        data: { access_policy: policy },
        successMessage: information.changesSaved
      }
    }),
  setEditors: ({ itemID, editors }: { itemID: LibraryItemID; editors: UserID[] }) =>
    axiosPatch({
      endpoint: `/api/library/${itemID}/set-editors`,
      request: {
        data: { users: editors },
        successMessage: information.changesSaved
      }
    }),

  deleteItem: (target: LibraryItemID) =>
    axiosDelete({
      endpoint: `/api/library/${target}`,
      request: {
        successMessage: information.itemDestroyed
      }
    }),
  cloneItem: (data: IRSFormCloneDTO) =>
    axiosPost<IRSFormCloneDTO, IRSFormData>({
      endpoint: `/api/library/${data.id}/clone`,
      request: {
        data: data,
        successMessage: newSchema => information.cloneComplete(newSchema.alias)
      }
    }),
  renameLocation: (data: IRenameLocationDTO) =>
    axiosPatch({
      endpoint: '/api/library/rename-location',
      request: {
        data: data,
        successMessage: information.locationRenamed
      }
    }),

  versionCreate: ({ itemID, data }: { itemID: LibraryItemID; data: IVersionData }) =>
    axiosPost<IVersionData, IVersionCreatedResponse>({
      endpoint: `/api/library/${itemID}/create-version`,
      request: {
        data: data,
        successMessage: information.newVersion(data.version)
      }
    }),
  versionRestore: ({ versionID }: { versionID: VersionID }) =>
    axiosPatch<undefined, IRSFormData>({
      endpoint: `/api/versions/${versionID}/restore`,
      request: {
        successMessage: information.versionRestored
      }
    }),
  versionUpdate: ({ versionID, data }: { versionID: VersionID; data: IVersionData }) =>
    axiosPatch<IVersionData, IVersionInfo>({
      endpoint: `/api/versions/${versionID}`,
      request: {
        data: data,
        successMessage: information.changesSaved
      }
    }),
  versionDelete: (data: { itemID: LibraryItemID; versionID: VersionID }) =>
    axiosDelete({
      endpoint: `/api/versions/${data.versionID}`,
      request: {
        successMessage: information.versionDestroyed
      }
    })
};
