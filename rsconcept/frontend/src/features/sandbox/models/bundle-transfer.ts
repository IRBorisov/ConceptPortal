import { AccessPolicy, LibraryItemType, LocationHead, type RSForm, type RSModel } from '@/domain/library';

import { type RSFormDTO } from '@/features/rsform/backend/types';
import { type RSModelDTO } from '@/features/rsmodel/backend/types';

import { nowIso } from '@/utils/format';

import { SANDBOX_BUNDLE_FORMAT_VERSION, type SandboxBundle, STARTER_MODEL_ID } from './bundle';

export function createSandboxBundleFromRSForm(schema: RSForm): SandboxBundle {
  const model = createEmptyModel(schema);
  return {
    formatVersion: SANDBOX_BUNDLE_FORMAT_VERSION,
    meta: {
      nextId: getNextConstituentaId(schema),
      updatedAt: nowIso()
    },
    schema: prepareRSForm(schema, model),
    model
  };
}

export function createSandboxBundleFromRSModel(schema: RSForm, model: RSModel): SandboxBundle {
  return {
    formatVersion: SANDBOX_BUNDLE_FORMAT_VERSION,
    meta: {
      nextId: getNextConstituentaId(schema),
      updatedAt: nowIso()
    },
    schema: prepareRSForm(schema, model),
    model: structuredClone(model) as RSModelDTO
  };
}

// ===== Internals =======
function getNextConstituentaId(schema: RSForm): number {
  return schema.items.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
}

function createEmptyModel(schema: RSForm): RSModelDTO {
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
    time_create: nowIso(),
    time_update: nowIso(),
    owner: null,
    editors: [],
    schema: schema.id,
    items: []
  };
}

function prepareRSForm(schema: RSForm, model: RSModel): RSFormDTO {
  return {
    id: schema.id,
    item_type: LibraryItemType.RSFORM,
    alias: schema.alias,
    title: schema.title,
    description: schema.description,
    visible: true,
    read_only: false,
    location: LocationHead.USER,
    access_policy: AccessPolicy.PUBLIC,
    time_create: nowIso(),
    time_update: nowIso(),
    owner: null,
    is_produced: false,
    editors: [],
    version: undefined,
    versions: [],
    items: schema.items.map(item => ({
      id: item.id,
      alias: item.alias,
      convention: item.convention,
      crucial: item.crucial,
      cst_type: item.cst_type,
      definition_formal: item.definition_formal,
      definition_raw: item.definition_raw,
      definition_resolved: item.definition_resolved,
      term_raw: item.term_raw,
      term_resolved: item.term_resolved,
      term_forms: item.term_forms.map(form => ({ text: form.text, tags: form.tags }))
    })),
    attribution: [...schema.attribution],
    inheritance: [],
    oss: [],
    models: [
      {
        id: model.id,
        alias: model.alias
      }
    ]
  };
}
