import { z } from 'zod';

import { errorMsg } from '@/utils/labels';

import { validateLocation } from '../models/library-api';

/** Represents type of library items. */
export const LibraryItemType = {
  RSFORM: 'rsform',
  OSS: 'oss'
} as const;
export type LibraryItemType = (typeof LibraryItemType)[keyof typeof LibraryItemType];

/** Represents Access policy for library items.*/
export const AccessPolicy = {
  PUBLIC: 'public',
  PROTECTED: 'protected',
  PRIVATE: 'private'
} as const;
export type AccessPolicy = (typeof AccessPolicy)[keyof typeof AccessPolicy];

/** Represents library item common data typical for all item types. */
export type ILibraryItem = z.infer<typeof schemaLibraryItem>;

/** Represents {@link ILibraryItem} data loaded for both OSS and RSForm. */
export interface ILibraryItemData extends ILibraryItem {
  editors: number[];
}

/** Represents update data for renaming Location. */
export interface IRenameLocationDTO {
  target: string;
  new_location: string;
}

/** Represents library item version information. */
export type IVersionInfo = z.infer<typeof schemaVersionInfo>;

/** Represents library item version extended information. */
export type IVersionExInfo = z.infer<typeof schemaVersionExInfo>;

/** Represents data, used for cloning {@link IRSForm}. */
export type ICloneLibraryItemDTO = z.infer<typeof schemaCloneLibraryItem>;

/** Represents data, used for creating {@link IRSForm}. */
export type ICreateLibraryItemDTO = z.infer<typeof schemaCreateLibraryItem>;

/** Represents update data for editing {@link ILibraryItem}. */
export type IUpdateLibraryItemDTO = z.infer<typeof schemaUpdateLibraryItem>;

/** Create version metadata in persistent storage. */
export type IVersionCreateDTO = z.infer<typeof schemaVersionCreate>;

/** Represents version data, intended to update version metadata in persistent storage. */
export type IVersionUpdateDTO = z.infer<typeof schemaVersionUpdate>;

// ======= SCHEMAS =========
export const schemaLibraryItemType = z.enum(Object.values(LibraryItemType) as [LibraryItemType, ...LibraryItemType[]]);
export const schemaAccessPolicy = z.enum(Object.values(AccessPolicy) as [AccessPolicy, ...AccessPolicy[]]);

export const schemaLibraryItem = z.strictObject({
  id: z.coerce.number(),
  item_type: schemaLibraryItemType,
  title: z.string(),
  alias: z.string().nonempty(),
  comment: z.string(),
  visible: z.boolean(),
  read_only: z.boolean(),
  location: z.string(),
  access_policy: schemaAccessPolicy,

  time_create: z.string().datetime({ offset: true }),
  time_update: z.string().datetime({ offset: true }),
  owner: z.coerce.number().nullable()
});

export const schemaLibraryItemArray = z.array(schemaLibraryItem);

export const schemaCloneLibraryItem = schemaLibraryItem
  .pick({
    id: true,
    item_type: true,
    title: true,
    alias: true,
    comment: true,
    visible: true,
    read_only: true,
    location: true,
    access_policy: true
  })
  .extend({
    title: z.string().nonempty(errorMsg.requiredField),
    alias: z.string().nonempty(errorMsg.requiredField),
    location: z.string().refine(data => validateLocation(data), { message: errorMsg.invalidLocation }),

    items: z.array(z.number())
  });

export const schemaCreateLibraryItem = z
  .object({
    item_type: schemaLibraryItemType,
    title: z.string().optional(),
    alias: z.string().optional(),
    comment: z.string(),
    visible: z.boolean(),
    read_only: z.boolean(),
    location: z.string().refine(data => validateLocation(data), { message: errorMsg.invalidLocation }),
    access_policy: schemaAccessPolicy,

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

export const schemaUpdateLibraryItem = z.strictObject({
  id: z.number(),
  item_type: schemaLibraryItemType,
  title: z.string().nonempty(errorMsg.requiredField),
  alias: z.string().nonempty(errorMsg.requiredField),
  comment: z.string(),
  visible: z.boolean(),
  read_only: z.boolean()
});

export const schemaVersionInfo = z.strictObject({
  id: z.coerce.number(),
  version: z.string(),
  description: z.string(),
  time_create: z.string().datetime({ offset: true })
});

export const schemaVersionExInfo = schemaVersionInfo.extend({
  item: z.number()
});

export const schemaVersionUpdate = z.strictObject({
  id: z.number(),
  version: z.string().nonempty(errorMsg.requiredField),
  description: z.string()
});

export const schemaVersionCreate = z.strictObject({
  version: z.string(),
  description: z.string(),
  items: z.array(z.number())
});
