/**
 * Library location / access / item-type UI strings.
 */
export const libraryLid = {
  location: {
    user: 'labels.library.location.user',
    common: 'labels.library.location.common',
    library: 'labels.library.location.library',
    projects: 'labels.library.location.projects'
  },
  locationShort: {
    user: 'labels.library.locationShort.user',
    common: 'labels.library.locationShort.common',
    library: 'labels.library.locationShort.library',
    projects: 'labels.library.locationShort.projects'
  },
  locationDesc: {
    user: 'labels.library.locationDesc.user',
    common: 'labels.library.locationDesc.common',
    library: 'labels.library.locationDesc.library',
    projects: 'labels.library.locationDesc.projects'
  },
  access: {
    private: 'labels.library.access.private',
    protected: 'labels.library.access.protected',
    public: 'labels.library.access.public'
  },
  accessDesc: {
    private: 'labels.library.accessDesc.private',
    protected: 'labels.library.accessDesc.protected',
    public: 'labels.library.accessDesc.public'
  },
  itemType: {
    rsform: 'labels.library.itemType.rsform',
    oss: 'labels.library.itemType.oss',
    rsmodel: 'labels.library.itemType.rsmodel'
  },
  itemTypeDesc: {
    rsform: 'labels.library.itemTypeDesc.rsform',
    oss: 'labels.library.itemTypeDesc.oss',
    rsmodel: 'labels.library.itemTypeDesc.rsmodel'
  },
  version: {
    current: 'labels.library.version.current'
  }
} as const;

export const LIBRARY_UI_DEFAULTS: Record<string, string> = {
  [libraryLid.location.user]: '/U : personal',
  [libraryLid.location.common]: '/S : shared',
  [libraryLid.location.library]: '/L : examples',
  [libraryLid.location.projects]: '/P : projects',

  [libraryLid.locationShort.user]: 'Personal',
  [libraryLid.locationShort.common]: 'Shared',
  [libraryLid.locationShort.library]: 'Examples',
  [libraryLid.locationShort.projects]: 'Projects',

  [libraryLid.locationDesc.user]: 'User’s private schemas',
  [libraryLid.locationDesc.common]: 'Working directory of public schemas',
  [libraryLid.locationDesc.library]: 'Catalog of immutable example schemas',
  [libraryLid.locationDesc.projects]: 'Working directory of project schemas',

  [libraryLid.access.private]: 'Private',
  [libraryLid.access.protected]: 'Protected',
  [libraryLid.access.public]: 'Public',

  [libraryLid.accessDesc.private]: 'Owner only',
  [libraryLid.accessDesc.protected]: 'Owner and editors',
  [libraryLid.accessDesc.public]: 'Open access',

  [libraryLid.itemType.rsform]: 'RS',
  [libraryLid.itemType.oss]: 'OSS',
  [libraryLid.itemType.rsmodel]: 'Model',

  [libraryLid.itemTypeDesc.rsform]: 'Conceptual schema',
  [libraryLid.itemTypeDesc.oss]: 'Operational synthesis schema',
  [libraryLid.itemTypeDesc.rsmodel]: 'Conceptual model',

  [libraryLid.version.current]: 'current'
};
