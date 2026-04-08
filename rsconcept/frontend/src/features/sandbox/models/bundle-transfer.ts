import { LocationHead } from '@/features/library';
import {
  AccessPolicy,
  LibraryItemType
} from '@/features/library/backend/types';
import { type RSFormDTO } from '@/features/rsform/backend/types';
import { type RSModelDTO } from '@/features/rsmodel/backend/types';

import { nowIso } from '@/utils/format';
import { type RO } from '@/utils/meta';

import { SANDBOX_BUNDLE_FORMAT_VERSION, type SandboxBundle, STARTER_MODEL_ID } from './bundle';

export function createSandboxBundleFromRSForm(schema: RO<RSFormDTO>): SandboxBundle {
  const model = createEmptyModel(schema);
  return {
    formatVersion: SANDBOX_BUNDLE_FORMAT_VERSION,
    meta: {
      nextId: getNextConstituentaId(schema),
      updatedAt: nowIso()
    },
    rsform: prepareRSForm(schema, model),
    model
  };
}

export function createSandboxBundleFromRSModel(
  schema: RO<RSFormDTO>,
  model: RO<RSModelDTO>
): SandboxBundle {
  return {
    formatVersion: SANDBOX_BUNDLE_FORMAT_VERSION,
    meta: {
      nextId: getNextConstituentaId(schema),
      updatedAt: nowIso()
    },
    rsform: prepareRSForm(schema, model),
    model: structuredClone(model) as RSModelDTO
  };
}

// ===== Internals =======
function getNextConstituentaId(schema: RO<RSFormDTO>): number {
  return schema.items.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
}

function createEmptyModel(schema: RO<RSFormDTO>): RSModelDTO {
  const timestamp = nowIso();
  return {
    id: STARTER_MODEL_ID,
    item_type: LibraryItemType.RSMODEL,
    alias: schema.alias,
    title: schema.title,
    description: schema.description,
    visible: true,
    read_only: false,
    location: LocationHead.USER,
    access_policy: AccessPolicy.PUBLIC,
    time_create: timestamp,
    time_update: timestamp,
    owner: null,
    editors: [],
    schema: schema.id,
    items: []
  };
}

function prepareRSForm(schema: RO<RSFormDTO>, model: RO<RSModelDTO>): RSFormDTO {
  const nextSchema = structuredClone(schema) as RSFormDTO;
  nextSchema.models = [{
    id: model.id,
    alias: model.alias
  }];
  return nextSchema;
}
