import { z } from 'zod';

import { limits } from '@/utils/constants';
import { errorMsg } from '@/utils/labels';

import { validateLocation } from '../models/library-api';

/** Represents type of library items. */
export const LibraryItemType = {
  RSFORM: 'rsform',
  OSS: 'oss',
  RSMODEL: 'rsmodel'
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
export type LibraryItem = z.infer<typeof schemaLibraryItem>;

/** Represents {@link LibraryItem} data loaded for both OSS and RSForm. */
export interface LibraryItemData extends LibraryItem {
  editors: number[];
}

/** Represents update data for renaming Location. */
export interface RenameLocationDTO {
  target: string;
  new_location: string;
}

/** Represents library item version information. */
export type VersionInfo = z.infer<typeof schemaVersionInfo>;

/** Represents library item version extended information. */
export type VersionExInfo = z.infer<typeof schemaVersionExInfo>;

/** Represents data, used for cloning {@link RSForm}. */
export type CloneLibraryItemDTO = z.infer<typeof schemaCloneLibraryItem>;

/** Represents data, used for creating {@link RSForm}. */
export type CreateLibraryItemDTO = z.infer<typeof schemaCreateLibraryItem>;

/** Represents update data for editing {@link LibraryItem}. */
export type UpdateLibraryItemDTO = z.infer<typeof schemaUpdateLibraryItem>;

/** Create version metadata in persistent storage. */
export type CreateVersionDTO = z.infer<typeof schemaCreateVersion>;

/** Represents version data, intended to update version metadata in persistent storage. */
export type UpdateVersionDTO = z.infer<typeof schemaUpdateVersion>;

// ======= SCHEMAS =========
export const schemaLibraryItemType = z.enum(Object.values(LibraryItemType) as [LibraryItemType, ...LibraryItemType[]]);
export const schemaAccessPolicy = z.enum(Object.values(AccessPolicy) as [AccessPolicy, ...AccessPolicy[]]);

export const schemaLibraryItem = z.strictObject({
  id: z.number(),
  item_type: schemaLibraryItemType,

  alias: z.string().nonempty(),
  title: z.string(),
  description: z.string(),

  visible: z.boolean(),
  read_only: z.boolean(),
  location: z.string(),
  access_policy: schemaAccessPolicy,

  time_create: z.iso.datetime({ offset: true }),
  time_update: z.iso.datetime({ offset: true }),
  owner: z.number().nullable()
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

    schema: z.number().optional(),
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
  }).refine(data => data.item_type !== LibraryItemType.RSMODEL || !!data.schema, {
    path: ['schema'],
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
  id: z.number(),
  version: z.string(),
  description: z.string(),
  time_create: z.iso.datetime({ offset: true })
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
