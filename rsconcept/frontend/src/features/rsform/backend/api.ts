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
import { errorMsg, infoMsg } from '@/utils/labels';

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
export const schemaCstUpdate = z.object({
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
export type ICstUpdateDTO = z.infer<typeof schemaCstUpdate>;

/**
 * Represents data, used in renaming {@link IConstituenta}.
 */
export const schemaCstRename = z.object({
  target: z.number(),
  alias: z.string(),
  cst_type: z.nativeEnum(CstType)
});

/**
 * Represents data, used in renaming {@link IConstituenta}.
 */
export type ICstRenameDTO = z.infer<typeof schemaCstRename>;

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
 * Represents data, used in merging single {@link IConstituenta}.
 */
export const schemaCstSubstitute = z.object({
  original: z.number(),
  substitution: z.number()
});

/**
 * Represents data, used in merging single {@link IConstituenta}.
 */
export type ICstSubstitute = z.infer<typeof schemaCstSubstitute>;

/**
 * Represents input data for inline synthesis.
 */
export const schemaInlineSynthesis = z.object({
  receiver: z.number(),
  source: z.number().nullable(),
  items: z.array(z.number()),
  substitutions: z.array(schemaCstSubstitute)
});

/**
 * Represents input data for inline synthesis.
 */
export type IInlineSynthesisDTO = z.infer<typeof schemaInlineSynthesis>;

/**
 * Represents {@link IConstituenta} data, used for checking expression.
 */
export interface ICheckConstituentaDTO {
  alias: string;
  cst_type: CstType;
  definition_formal: string;
}

/**
 * Represents data, used in renaming {@link IConstituenta}.
 */
export const schemaCstSubstitutions = z.object({
  substitutions: z.array(schemaCstSubstitute).min(1, { message: errorMsg.emptySubstitutions })
});

/**
 * Represents data, used in merging multiple {@link IConstituenta}.
 */
export type ICstSubstitutionsDTO = z.infer<typeof schemaCstSubstitutions>;

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
        successMessage: infoMsg.uploadSuccess
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
        successMessage: response => infoMsg.newConstituent(response.new_cst.alias)
      }
    }),
  cstUpdate: ({ itemID, data }: { itemID: LibraryItemID; data: ICstUpdateDTO }) =>
    axiosPatch<ICstUpdateDTO, IConstituentaMeta>({
      endpoint: `/api/rsforms/${itemID}/update-cst`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  cstDelete: ({ itemID, data }: { itemID: LibraryItemID; data: IConstituentaList }) =>
    axiosPatch<IConstituentaList, IRSFormDTO>({
      endpoint: `/api/rsforms/${itemID}/delete-multiple-cst`,
      request: {
        data: data,
        successMessage: infoMsg.constituentsDestroyed(data.items.length)
      }
    }),
  cstRename: ({ itemID, data }: { itemID: LibraryItemID; data: ICstRenameDTO }) =>
    axiosPatch<ICstRenameDTO, ICstCreatedResponse>({
      endpoint: `/api/rsforms/${itemID}/rename-cst`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  cstSubstitute: ({ itemID, data }: { itemID: LibraryItemID; data: ICstSubstitutionsDTO }) =>
    axiosPatch<ICstSubstitutionsDTO, IRSFormDTO>({
      endpoint: `/api/rsforms/${itemID}/substitute`,
      request: {
        data: data,
        successMessage: infoMsg.substituteSingle
      }
    }),
  cstMove: ({ itemID, data }: { itemID: LibraryItemID; data: ICstMoveDTO }) =>
    axiosPatch<ICstMoveDTO, IRSFormDTO>({
      endpoint: `/api/rsforms/${itemID}/move-cst`,
      request: { data: data }
    }),

  produceStructure: ({ itemID, data }: { itemID: LibraryItemID; data: ITargetCst }) =>
    axiosPatch<ITargetCst, IProduceStructureResponse>({
      endpoint: `/api/rsforms/${itemID}/produce-structure`,
      request: {
        data: data,
        successMessage: response => infoMsg.addedConstituents(response.cst_list.length)
      }
    }),
  inlineSynthesis: (data: IInlineSynthesisDTO) =>
    axiosPatch<IInlineSynthesisDTO, IRSFormDTO>({
      endpoint: `/api/rsforms/inline-synthesis`,
      request: {
        data: data,
        successMessage: infoMsg.inlineSynthesisComplete
      }
    }),
  restoreOrder: ({ itemID }: { itemID: LibraryItemID }) =>
    axiosPatch<undefined, IRSFormDTO>({
      endpoint: `/api/rsforms/${itemID}/restore-order`,
      request: { successMessage: infoMsg.reorderComplete }
    }),
  resetAliases: ({ itemID }: { itemID: LibraryItemID }) =>
    axiosPatch<undefined, IRSFormDTO>({
      endpoint: `/api/rsforms/${itemID}/reset-aliases`,
      request: { successMessage: infoMsg.reindexComplete }
    }),

  checkConstituenta: ({ itemID, data }: { itemID: LibraryItemID; data: ICheckConstituentaDTO }) =>
    axiosPost<ICheckConstituentaDTO, IExpressionParse>({
      endpoint: `/api/rsforms/${itemID}/check-constituenta`,
      request: { data: data }
    })
};
