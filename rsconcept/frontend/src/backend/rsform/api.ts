import { queryOptions } from '@tanstack/react-query';

import { axiosInstance } from '@/backend/axiosInstance';
import { DELAYS } from '@/backend/configuration';
import { LibraryItemID, VersionID } from '@/models/library';
import { ICstSubstitute, ICstSubstitutions } from '@/models/oss';
import {
  ConstituentaID,
  CstType,
  IConstituentaList,
  IConstituentaMeta,
  IRSFormData,
  ITargetCst,
  TermForm
} from '@/models/rsform';
import { IExpressionParse } from '@/models/rslang';

/**
 * Represents data, used for uploading {@link IRSForm} as file.
 */
export interface IRSFormUploadDTO {
  itemID: LibraryItemID;
  load_metadata: boolean;
  file: File;
  fileName: string;
}

/**
 * Represents {@link IConstituenta} data, used in creation process.
 */
export interface ICstCreateDTO {
  alias: string;
  cst_type: CstType;
  definition_raw: string;
  term_raw: string;
  convention: string;
  definition_formal: string;
  term_forms: TermForm[];

  insert_after: ConstituentaID | null;
}

/**
 * Represents data response when creating {@link IConstituenta}.
 */
export interface ICstCreatedResponse {
  new_cst: IConstituentaMeta;
  schema: IRSFormData;
}

/**
 * Represents data, used in updating persistent attributes in {@link IConstituenta}.
 */
export interface ICstUpdateDTO {
  target: ConstituentaID;
  item_data: {
    convention?: string;
    definition_formal?: string;
    definition_raw?: string;
    term_raw?: string;
    term_forms?: TermForm[];
  };
}

/**
 * Represents data, used in renaming {@link IConstituenta}.
 */
export interface ICstRenameDTO {
  alias: string;
  cst_type: CstType;
  target: ConstituentaID;
}

/**
 * Represents data, used in ordering a list of {@link IConstituenta}.
 */
export interface ICstMoveDTO {
  items: ConstituentaID[];
  move_to: number; // Note: 0-base index
}

/**
 * Represents data response when creating producing structure of {@link IConstituenta}.
 */
export interface IProduceStructureResponse {
  cst_list: ConstituentaID[];
  schema: IRSFormData;
}

/**
 * Represents input data for inline synthesis.
 */
export interface IInlineSynthesisDTO {
  receiver: LibraryItemID;
  source: LibraryItemID;
  items: ConstituentaID[];
  substitutions: ICstSubstitute[];
}

/**
 * Represents {@link IConstituenta} data, used for checking expression.
 */
export interface ICheckConstituentaDTO {
  alias: string;
  cst_type: CstType;
  definition_formal: string;
}

export const rsformsApi = {
  baseKey: 'rsform',

  getRSFormQueryOptions: ({ itemID, version }: { itemID?: LibraryItemID; version?: VersionID }) => {
    return queryOptions({
      queryKey: [rsformsApi.baseKey, 'item', itemID, version ?? ''],
      staleTime: DELAYS.staleShort,
      queryFn: meta =>
        !itemID
          ? undefined
          : axiosInstance
              .get<IRSFormData>(
                version ? `/api/library/${itemID}/versions/${version}` : `/api/rsforms/${itemID}/details`,
                {
                  signal: meta.signal
                }
              )
              .then(response => response.data)
    });
  },

  download: ({ itemID, version }: { itemID: LibraryItemID; version?: VersionID }) =>
    axiosInstance //
      .get<Blob>(version ? `/api/versions/${version}/export-file` : `/api/rsforms/${itemID}/export-trs`, {
        responseType: 'blob'
      })
      .then(response => response.data),
  upload: (data: IRSFormUploadDTO) =>
    axiosInstance //
      .patch<IRSFormData>(`/api/rsforms/${data.itemID}/load-trs`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => response.data),

  cstCreate: ({ itemID, data }: { itemID: LibraryItemID; data: ICstCreateDTO }) =>
    axiosInstance //
      .post<ICstCreatedResponse>(`/api/rsforms/${itemID}/create-cst`, data)
      .then(response => response.data),
  cstUpdate: ({ itemID, data }: { itemID: LibraryItemID; data: ICstUpdateDTO }) =>
    axiosInstance //
      .patch<IConstituentaMeta>(`/api/rsforms/${itemID}/update-cst`, data)
      .then(response => response.data),
  cstDelete: ({ itemID, data }: { itemID: LibraryItemID; data: IConstituentaList }) =>
    axiosInstance //
      .patch<IRSFormData>(`/api/rsforms/${itemID}/delete-multiple-cst`, data)
      .then(response => response.data),
  cstRename: ({ itemID, data }: { itemID: LibraryItemID; data: ICstRenameDTO }) =>
    axiosInstance //
      .patch<ICstCreatedResponse>(`/api/rsforms/${itemID}/rename-cst`, data)
      .then(response => response.data),
  cstSubstitute: ({ itemID, data }: { itemID: LibraryItemID; data: ICstSubstitutions }) =>
    axiosInstance //
      .patch<IRSFormData>(`/api/rsforms/${itemID}/substitute`, data)
      .then(response => response.data),
  cstMove: ({ itemID, data }: { itemID: LibraryItemID; data: ICstMoveDTO }) =>
    axiosInstance //
      .patch<IRSFormData>(`/api/rsforms/${itemID}/move-cst`, data)
      .then(response => response.data),

  produceStructure: ({ itemID, data }: { itemID: LibraryItemID; data: ITargetCst }) =>
    axiosInstance //
      .post<IProduceStructureResponse>(`/api/rsforms/${itemID}/produce-structure`, data)
      .then(response => response.data),
  inlineSynthesis: ({ itemID, data }: { itemID: LibraryItemID; data: IInlineSynthesisDTO }) =>
    axiosInstance //
      .post<IRSFormData>(`/api/rsforms/${itemID}/inline-synthesis`, data)
      .then(response => response.data),
  restoreOrder: (itemID: LibraryItemID) =>
    axiosInstance //
      .patch<IRSFormData>(`/api/rsforms/${itemID}/restore-order`)
      .then(response => response.data),
  resetAliases: (itemID: LibraryItemID) =>
    axiosInstance //
      .patch<IRSFormData>(`/api/rsforms/${itemID}/reset-aliases`)
      .then(response => response.data),

  checkConstituenta: ({ itemID, data }: { itemID: LibraryItemID; data: ICheckConstituentaDTO }) =>
    axiosInstance //
      .post<IExpressionParse>(`/api/rsforms/${itemID}/check-constituenta`, data)
      .then(response => response.data)
};
