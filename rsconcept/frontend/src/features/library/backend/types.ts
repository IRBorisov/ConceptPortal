import { z } from 'zod';

import { limits } from '@/utils/constants';
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
export type ICreateVersionDTO = z.infer<typeof schemaCreateVersion>;

/** Represents version data, intended to update version metadata in persistent storage. */
export type IUpdateVersionDTO = z.infer<typeof schemaUpdateVersion>;

// ======= SCHEMAS =========
export const schemaLibraryItemType = z.enum(Object.values(LibraryItemType) as [LibraryItemType, ...LibraryItemType[]]);
export const schemaAccessPolicy = z.enum(Object.values(AccessPolicy) as [AccessPolicy, ...AccessPolicy[]]);

export const schemaLibraryItem = z.strictObject({
  id: z.coerce.number(),
  item_type: schemaLibraryItemType,

  alias: z.string().nonempty(),
  title: z.string(),
  description: z.string(),

  visible: z.boolean(),
  read_only: z.boolean(),
  location: z.string(),
  access_policy: schemaAccessPolicy,

  time_create: z.string().datetime({ offset: true }),
  time_update: z.string().datetime({ offset: true }),
  owner: z.coerce.number().nullable()
});

export const schemaLibraryItemArray = z.array(schemaLibraryItem);

const schemaInputLibraryItem = schemaLibraryItem
  .pick({
    item_type: true,
    visible: true,
    read_only: true,
    access_policy: true
  })
  .extend({
    alias: z.string().max(limits.len_alias, errorMsg.aliasLength).nonempty(errorMsg.requiredField),
    title: z.string().max(limits.len_title, errorMsg.titleLength).nonempty(errorMsg.requiredField),
    description: z.string().max(limits.len_description, errorMsg.descriptionLength),
    location: z.string().refine(data => validateLocation(data), { message: errorMsg.invalidLocation })
  });

export const schemaCloneLibraryItem = z.strictObject({
  items: z.array(z.number()),
  item_data: schemaInputLibraryItem.omit({ item_type: true, read_only: true })
});

export const schemaCreateLibraryItem = schemaInputLibraryItem
  .extend({
    alias: z.string().max(limits.len_alias, errorMsg.aliasLength).optional(),
    title: z.string().max(limits.len_title, errorMsg.titleLength).optional(),
    description: z.string().max(limits.len_description, errorMsg.descriptionLength).optional(),

    file: z.instanceof(File).optional(),
    fileName: z.string().optional()
  })
  .refine(data => !!data.file || !!data.alias, {
    path: ['alias'],
    message: errorMsg.requiredField
  })
  .refine(data => !!data.file || !!data.title, {
    path: ['title'],
    message: errorMsg.requiredField
  });

export const schemaUpdateLibraryItem = schemaInputLibraryItem
  .omit({
    location: true,
    access_policy: true
  })
  .extend({
    id: z.number()
  });

export const schemaVersionInfo = z.strictObject({
  id: z.coerce.number(),
  version: z.string(),
  description: z.string(),
  time_create: z.string().datetime({ offset: true })
});

const schemaVersionInput = z.strictObject({
  version: z.string().max(limits.len_alias, errorMsg.aliasLength).nonempty(errorMsg.requiredField),
  description: z.string().max(limits.len_description, errorMsg.descriptionLength)
});

export const schemaVersionExInfo = schemaVersionInfo.extend({
  item: z.number()
});

export const schemaUpdateVersion = schemaVersionInput.extend({
  id: z.number()
});

export const schemaCreateVersion = schemaVersionInput.extend({
  items: z.array(z.number())
});
