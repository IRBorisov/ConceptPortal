import { z } from 'zod';

import { ILibraryItemReference, ILibraryItemVersioned } from '@/features/library/models/library';

import { errorMsg } from '@/utils/labels';

import { CstType, IConstituentaMeta, IInheritanceInfo, TermForm } from '../models/rsform';
import { IArgumentInfo, ParsingStatus, ValueClass } from '../models/rslang';

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
  itemID: number;
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

  insert_after: number | null;
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
  items: number[];
  move_to: number; // Note: 0-base index
}

/**
 * Represents data response when creating producing structure of {@link IConstituenta}.
 */
export interface IProduceStructureResponse {
  cst_list: number[];
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
