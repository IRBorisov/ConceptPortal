import { AccessPolicy, LibraryItemType } from '@rsconcept/domain/library';

import { type OperationSchemaDTO } from '@/features/oss';
import { type RSFormDTO } from '@/features/rsform';
import { type RSModelDTO } from '@/features/rsmodel';

export function createMinimalLibraryItemFields(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    item_type: LibraryItemType.RSFORM,
    alias: 'test',
    title: 'Title',
    description: 'Description',
    visible: true,
    read_only: false,
    location: '',
    access_policy: AccessPolicy.PUBLIC,
    time_create: '2020-01-01T00:00:00Z',
    time_update: '2020-01-01T00:00:00Z',
    owner: 1,
    ...overrides
  };
}

export function createMinimalRSFormDTO(overrides: Partial<RSFormDTO> = {}): RSFormDTO {
  return {
    ...createMinimalLibraryItemFields(),
    editors: [],
    versions: [],
    attribution: [],
    is_produced: false,
    oss: [],
    models: [],
    items: [],
    inheritance: [],
    ...overrides
  };
}

export function createMinimalRSModelDTO(overrides: Partial<RSModelDTO> = {}): RSModelDTO {
  return {
    ...createMinimalLibraryItemFields({ item_type: LibraryItemType.RSMODEL }),
    editors: [],
    schema: 2,
    items: [],
    ...overrides
  };
}

export function createMinimalOssDTO(overrides: Partial<OperationSchemaDTO> = {}): OperationSchemaDTO {
  return {
    ...createMinimalLibraryItemFields({ id: 3, item_type: LibraryItemType.OSS }),
    editors: [],
    operations: [],
    blocks: [],
    replicas: [],
    layout: [],
    arguments: [],
    substitutions: [],
    ...overrides
  };
}
