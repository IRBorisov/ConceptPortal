import { queryOptions } from '@tanstack/react-query';

import { axiosInstance } from '@/backend/axiosInstance';
import { DELAYS } from '@/backend/configuration';
import { AccessPolicy, ILibraryItem, IVersionData, LibraryItemID, LibraryItemType, VersionID } from '@/models/library';
import { ConstituentaID, IRSFormData } from '@/models/rsform';
import { UserID } from '@/models/user';

import { ossApi } from '../oss/api';
import { rsformsApi } from '../rsform/api';

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

  getLibraryQueryOptions: ({ isAdmin }: { isAdmin: boolean }) =>
    queryOptions({
      queryKey: libraryApi.libraryListKey,
      staleTime: DELAYS.staleMedium,
      queryFn: meta =>
        axiosInstance
          .get<ILibraryItem[]>(isAdmin ? '/api/library/all' : '/api/library/active', {
            signal: meta.signal
          })
          .then(response => response.data)
    }),
  getItemQueryOptions: ({ itemID, itemType }: { itemID: LibraryItemID; itemType: LibraryItemType }) => {
    return itemType === LibraryItemType.RSFORM
      ? rsformsApi.getRSFormQueryOptions({ itemID })
      : ossApi.getOssQueryOptions({ itemID });
  },
  getTemplatesQueryOptions: () =>
    queryOptions({
      queryKey: [libraryApi.baseKey, 'templates'],
      staleTime: DELAYS.staleMedium,
      queryFn: meta =>
        axiosInstance
          .get<ILibraryItem[]>('/api/library/templates', {
            signal: meta.signal
          })
          .then(response => response.data)
    }),

  createItem: (data: ILibraryCreateDTO) =>
    data.file
      ? axiosInstance
          .post<ILibraryItem>('/api/rsforms/create-detailed', data, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          .then(response => response.data)
      : axiosInstance //
          .post<ILibraryItem>('/api/library', data)
          .then(response => response.data),

  updateItem: (data: ILibraryUpdateDTO) =>
    axiosInstance //
      .patch<ILibraryItem>(`/api/library/${data.id}`, data)
      .then(response => response.data),
  setOwner: (data: { itemID: LibraryItemID; owner: UserID }) =>
    axiosInstance //
      .patch(`/api/library/${data.itemID}/set-owner`, { user: data.owner }),
  setLocation: (data: { itemID: LibraryItemID; location: string }) =>
    axiosInstance //
      .patch(`/api/library/${data.itemID}/set-location`, { location: data.location }),
  setAccessPolicy: (data: { itemID: LibraryItemID; policy: AccessPolicy }) =>
    axiosInstance //
      .patch(`/api/library/${data.itemID}/set-access-policy`, { access_policy: data.policy }),
  setEditors: (data: { itemID: LibraryItemID; editors: UserID[] }) =>
    axiosInstance //
      .patch(`/api/library/${data.itemID}/set-editors`, { users: data.editors }),

  deleteItem: (target: LibraryItemID) =>
    axiosInstance //
      .delete(`/api/library/${target}`),
  cloneItem: (data: IRSFormCloneDTO) =>
    axiosInstance //
      .post<IRSFormData>(`/api/library/${data.id}/clone`, data)
      .then(response => response.data),
  renameLocation: (data: IRenameLocationDTO) =>
    axiosInstance //
      .patch('/api/library/rename-location', data),

  versionCreate: (data: { itemID: LibraryItemID; data: IVersionData }) =>
    axiosInstance //
      .post<IVersionCreatedResponse>(`/api/library/${data.itemID}/versions`, data.data)
      .then(response => response.data),
  versionRestore: (data: { itemID: LibraryItemID; versionID: VersionID }) =>
    axiosInstance //
      .patch<IRSFormData>(`/api/versions/${data.versionID}/restore`)
      .then(response => response.data),
  versionUpdate: (data: { itemID: LibraryItemID; versionID: VersionID; data: IVersionData }) =>
    axiosInstance //
      .patch(`/api/versions/${data.versionID}`, data.data),
  versionDelete: (data: { itemID: LibraryItemID; versionID: VersionID }) =>
    axiosInstance //
      .delete(`/api/versions/${data.versionID}`)
};
