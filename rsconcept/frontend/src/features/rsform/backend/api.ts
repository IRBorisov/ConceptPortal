import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';

import { axiosGet, axiosPatch, axiosPost } from '@/backend/apiTransport';
import { DELAYS } from '@/backend/configuration';
import {
  ILibraryItemReference,
  ILibraryItemVersioned,
  LibraryItemID,
  VersionID
} from '@/features/library/models/library';
import { ICstSubstitute, ICstSubstitutions } from '@/features/oss/models/oss';
import { information } from '@/utils/labels';

import {
  ConstituentaID,
  CstType,
  IConstituentaList,
  IConstituentaMeta,
  IInheritanceInfo,
  ITargetCst,
  TermForm
} from '../models/rsform';
import { IArgumentInfo, IExpressionParse, ParsingStatus, ValueClass } from '../models/rslang';

/**
 * Represents {@link IConstituenta} data from server.
 */
export interface IConstituentaDTO extends IConstituentaMeta {
  parse: {
    status: ParsingStatus;
    valueClass: ValueClass;
    typification: string;
    syntaxTree: string;
    args: IArgumentInfo[];
  };
}

/**
 * Represents data for {@link IRSForm} provided by backend.
 */
export interface IRSFormDTO extends ILibraryItemVersioned {
  items: IConstituentaDTO[];
  inheritance: IInheritanceInfo[];
  oss: ILibraryItemReference[];
}

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
  schema: IRSFormDTO;
}

/**
 * Represents data, used in updating persistent attributes in {@link IConstituenta}.
 */
export const CstUpdateSchema = z.object({
  target: z.number(),
  item_data: z.object({
    convention: z.string().optional(),
    definition_formal: z.string().optional(),
    definition_raw: z.string().optional(),
    term_raw: z.string().optional(),
    term_forms: z.array(z.object({ text: z.string(), tags: z.string() })).optional()
  })
});

/**
 * Represents data, used in updating persistent attributes in {@link IConstituenta}.
 */
export type ICstUpdateDTO = z.infer<typeof CstUpdateSchema>;

/**
 * Represents data, used in renaming {@link IConstituenta}.
 */
export const CstRenameSchema = z.object({
  target: z.number(),
  alias: z.string(),
  cst_type: z.nativeEnum(CstType)
});

/**
 * Represents data, used in renaming {@link IConstituenta}.
 */
export type ICstRenameDTO = z.infer<typeof CstRenameSchema>;

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
  schema: IRSFormDTO;
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
          : axiosGet<IRSFormDTO>({
              endpoint: version ? `/api/library/${itemID}/versions/${version}` : `/api/rsforms/${itemID}/details`,
              options: { signal: meta.signal }
            })
    });
  },

  download: ({ itemID, version }: { itemID: LibraryItemID; version?: VersionID }) =>
    axiosGet<Blob>({
      endpoint: version ? `/api/versions/${version}/export-file` : `/api/rsforms/${itemID}/export-trs`,
      options: { responseType: 'blob' }
    }),
  upload: (data: IRSFormUploadDTO) =>
    axiosPatch<IRSFormUploadDTO, IRSFormDTO>({
      endpoint: `/api/rsforms/${data.itemID}/load-trs`,
      request: {
        data: data,
        successMessage: information.uploadSuccess
      },
      options: {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    }),

  cstCreate: ({ itemID, data }: { itemID: LibraryItemID; data: ICstCreateDTO }) =>
    axiosPost<ICstCreateDTO, ICstCreatedResponse>({
      endpoint: `/api/rsforms/${itemID}/create-cst`,
      request: {
        data: data,
        successMessage: response => information.newConstituent(response.new_cst.alias)
      }
    }),
  cstUpdate: ({ itemID, data }: { itemID: LibraryItemID; data: ICstUpdateDTO }) =>
    axiosPatch<ICstUpdateDTO, IConstituentaMeta>({
      endpoint: `/api/rsforms/${itemID}/update-cst`,
      request: {
        data: data,
        successMessage: information.changesSaved
      }
    }),
  cstDelete: ({ itemID, data }: { itemID: LibraryItemID; data: IConstituentaList }) =>
    axiosPatch<IConstituentaList, IRSFormDTO>({
      endpoint: `/api/rsforms/${itemID}/delete-multiple-cst`,
      request: {
        data: data,
        successMessage: information.constituentsDestroyed(data.items.length)
      }
    }),
  cstRename: ({ itemID, data }: { itemID: LibraryItemID; data: ICstRenameDTO }) =>
    axiosPatch<ICstRenameDTO, ICstCreatedResponse>({
      endpoint: `/api/rsforms/${itemID}/rename-cst`,
      request: {
        data: data,
        successMessage: information.changesSaved
      }
    }),
  cstSubstitute: ({ itemID, data }: { itemID: LibraryItemID; data: ICstSubstitutions }) =>
    axiosPatch<ICstSubstitutions, IRSFormDTO>({
      endpoint: `/api/rsforms/${itemID}/substitute`,
      request: {
        data: data,
        successMessage: information.substituteSingle
      }
    }),
  cstMove: ({ itemID, data }: { itemID: LibraryItemID; data: ICstMoveDTO }) =>
    axiosPatch<ICstMoveDTO, IRSFormDTO>({
      endpoint: `/api/rsforms/${itemID}/move-cst`,
      request: { data: data }
    }),

  produceStructure: ({ itemID, data }: { itemID: LibraryItemID; data: ITargetCst }) =>
    axiosPost<ITargetCst, IProduceStructureResponse>({
      endpoint: `/api/rsforms/${itemID}/produce-structure`,
      request: {
        data: data,
        successMessage: response => information.addedConstituents(response.cst_list.length)
      }
    }),
  inlineSynthesis: ({ itemID, data }: { itemID: LibraryItemID; data: IInlineSynthesisDTO }) =>
    axiosPost<IInlineSynthesisDTO, IRSFormDTO>({
      endpoint: `/api/rsforms/${itemID}/inline-synthesis`,
      request: {
        data: data,
        successMessage: information.inlineSynthesisComplete
      }
    }),
  restoreOrder: ({ itemID }: { itemID: LibraryItemID }) =>
    axiosPatch<undefined, IRSFormDTO>({
      endpoint: `/api/rsforms/${itemID}/restore-order`,
      request: { successMessage: information.reorderComplete }
    }),
  resetAliases: ({ itemID }: { itemID: LibraryItemID }) =>
    axiosPatch<undefined, IRSFormDTO>({
      endpoint: `/api/rsforms/${itemID}/reset-aliases`,
      request: { successMessage: information.reindexComplete }
    }),

  checkConstituenta: ({ itemID, data }: { itemID: LibraryItemID; data: ICheckConstituentaDTO }) =>
    axiosPost<ICheckConstituentaDTO, IExpressionParse>({
      endpoint: `/api/rsforms/${itemID}/check-constituenta`,
      request: { data: data }
    })
};
