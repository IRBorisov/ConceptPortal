import { z } from 'zod';

import { IRSFormDTO } from '@/features/rsform/backend/types';

import { errorMsg } from '@/utils/labels';

import { validateLocation } from '../models/libraryAPI';

/** Represents type of library items. */
export enum LibraryItemType {
  RSFORM = 'rsform',
  OSS = 'oss'
}

/** Represents Access policy for library items.*/
export enum AccessPolicy {
  PUBLIC = 'public',
  PROTECTED = 'protected',
  PRIVATE = 'private'
}

/**
 * Represents library item common data typical for all item types.
 */
export interface ILibraryItem {
  id: number;
  item_type: LibraryItemType;
  title: string;
  alias: string;
  comment: string;
  visible: boolean;
  read_only: boolean;
  location: string;
  access_policy: AccessPolicy;
  time_create: string;
  time_update: string;
  owner: number | null;
}

/**
 * Represents {@link ILibraryItem} constant data loaded for both OSS and RSForm.
 */
export interface ILibraryItemData extends ILibraryItem {
  editors: number[];
}

/**
 * Represents update data for renaming Location.
 */
export interface IRenameLocationDTO {
  target: string;
  new_location: string;
}

/** Represents library item version information. */
export type IVersionInfo = z.infer<typeof schemaVersionInfo>;

/** Represents data, used for cloning {@link IRSForm}. */
export type ICloneLibraryItemDTO = z.infer<typeof schemaCloneLibraryItem>;

/** Represents data, used for creating {@link IRSForm}. */
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

/** Represents version data, intended to update version metadata in persistent storage. */
export type IVersionUpdateDTO = z.infer<typeof schemaVersionUpdate>;

// ======= SCHEMAS =========
/** Represents data, used for cloning {@link IRSForm}. */
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

export const schemaVersionInfo = z.object({
  id: z.coerce.number(),
  version: z.string(),
  description: z.string(),
  time_create: z.string()
});

export const schemaVersionUpdate = z.object({
  id: z.number(),
  version: z.string().nonempty(errorMsg.requiredField),
  description: z.string()
});
