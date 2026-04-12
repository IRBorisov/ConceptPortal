import { type RSFormDTO } from '@/features/rsform/backend/types';
import { CstType } from '@/features/rsform/models/rsform';
import { type RSModelDTO } from '@/features/rsmodel/backend/types';

import { LocationHead } from '@/domain/library';
import { AccessPolicy, type LibraryItem, LibraryItemType } from '@/domain/library';

import {
  SANDBOX_BUNDLE_FORMAT_VERSION,
  type SandboxBundle,
  STARTER_CST_ID,
  STARTER_MODEL_ID,
  STARTER_SCHEMA_ID
} from './bundle';

function libraryBase(
  id: number,
  itemType: LibraryItem['item_type'],
  alias: string,
  title: string,
  timestamp: string
): Pick<
  LibraryItem,
  | 'id'
  | 'item_type'
  | 'alias'
  | 'title'
  | 'description'
  | 'visible'
  | 'read_only'
  | 'location'
  | 'access_policy'
  | 'time_create'
  | 'time_update'
  | 'owner'
> {
  return {
    id,
    item_type: itemType,
    alias,
    title,
    description: '',
    visible: true,
    read_only: false,
    location: LocationHead.USER,
    access_policy: AccessPolicy.PUBLIC,
    time_create: timestamp,
    time_update: timestamp,
    owner: null
  };
}

/** Minimal RSForm + RSModel pair for first launch (validated by the same Zod schemas as the API). */
export function createStarterSandboxBundle(): SandboxBundle {
  const now = new Date().toISOString();
  const rsform: RSFormDTO = {
    ...libraryBase(STARTER_SCHEMA_ID, LibraryItemType.RSFORM, 'КС Демонстрация', 'Демонстрационная схема', now),
    is_produced: false,
    editors: [],
    version: SANDBOX_BUNDLE_FORMAT_VERSION,
    versions: [],
    items: [
      {
        id: STARTER_CST_ID,
        alias: 'X1',
        convention: '',
        crucial: false,
        cst_type: CstType.BASE,
        definition_formal: '',
        definition_raw: '',
        definition_resolved: '',
        term_raw: '',
        term_resolved: '',
        term_forms: []
      }
    ],
    attribution: [],
    inheritance: [],
    oss: [],
    models: [{ id: STARTER_MODEL_ID, alias: 'КМ Демонстрация' }]
  };

  const model: RSModelDTO = {
    ...libraryBase(STARTER_MODEL_ID, LibraryItemType.RSMODEL, 'КМ Демонстрация', 'Демонстрационная модель', now),
    editors: [],
    schema: STARTER_SCHEMA_ID,
    items: []
  };

  return {
    formatVersion: SANDBOX_BUNDLE_FORMAT_VERSION,
    meta: {
      nextId: STARTER_CST_ID + rsform.items.length,
      updatedAt: now
    },
    schema: rsform,
    model
  };
}
