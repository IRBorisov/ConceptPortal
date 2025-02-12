/** Timing constants for API requests. */
export const DELAYS = {
  garbageCollection: 1 * 60 * 60 * 1000,
  staleDefault: 5 * 60 * 1000,

  staleShort: 5 * 60 * 1000,
  staleMedium: 1 * 60 * 60 * 1000,
  staleLong: 24 * 60 * 60 * 1000
};

/** API keys for local cache. */
export const KEYS = {
  oss: 'oss',
  rsform: 'rsform',
  library: 'library',
  users: 'users',
  cctext: 'cctext',

  composite: {
    libraryList: ['library', 'list'],
    ossItem: ({ itemID }: { itemID?: number }) => [KEYS.oss, 'item', itemID],
    rsItem: ({ itemID, version }: { itemID?: number; version?: number }) => [KEYS.rsform, 'item', itemID, version ?? '']
  }
};
