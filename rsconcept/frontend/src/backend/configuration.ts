/** Timing constants for API requests. */
export const DELAYS = {
  garbageCollection: 1 * 60 * 60 * 1000,
  staleDefault: 5 * 60 * 1000,

  staleShort: 5 * 60 * 1000,
  staleMedium: 1 * 60 * 60 * 1000,
  staleLong: 24 * 60 * 60 * 1000
} as const;

/** API keys for local cache. */
export const KEYS = {
  oss: 'oss',
  auth: 'auth',
  rsform: 'rsform',
  rsmodel: 'rsmodel',
  library: 'library',
  users: 'users',
  cctext: 'cctext',
  prompts: 'prompts',
  global_mutation: 'global_mutation',

  composite: {
    libraryList: ['library', 'list'] as const,
    ossItem: ({ itemID }: { itemID?: number | null; }) => [KEYS.oss, 'item', itemID],
    modelItem: ({ itemID }: { itemID?: number | null; }) => [KEYS.rsmodel, 'item', itemID],
    rsItem: ({ itemID, version }: { itemID?: number | null; version?: number; }) =>
      [KEYS.rsform, 'item', itemID, version ?? '']
  }
} as const;
