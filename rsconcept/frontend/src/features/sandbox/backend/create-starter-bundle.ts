import {
  AccessPolicy,
  type LibraryItem,
  LibraryItemType
} from '@/features/library/backend/types';
import { type RSFormDTO } from '@/features/rsform/backend/types';
import { CstType } from '@/features/rsform/models/rsform';
import { type RSModelDTO } from '@/features/rsmodel/backend/types';

import {
  SANDBOX_BUNDLE_FORMAT_VERSION,
  type SandboxBundle
} from '../models/bundle';

const STARTER_SCHEMA_ID = -1;
const STARTER_MODEL_ID = -2;
const STARTER_CST_ID = -10_000;

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
    location: 'sandbox',
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
    ...libraryBase(STARTER_SCHEMA_ID, LibraryItemType.RSFORM, 'demo-schema', 'Демонстрационная схема', now),
    is_produced: false,
    editors: [],
    version: 1,
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
    models: [{ id: STARTER_MODEL_ID, alias: 'demo-model' }]
  };
  const model: RSModelDTO = {
    ...libraryBase(STARTER_MODEL_ID, LibraryItemType.RSMODEL, 'demo-model', 'Демонстрационная модель', now),
    editors: [],
    schema: STARTER_SCHEMA_ID,
    items: []
  };
  return {
    formatVersion: SANDBOX_BUNDLE_FORMAT_VERSION,
    meta: {
      nextId: 1000,
      updatedAt: now
    },
    rsform,
    model
  };
}
