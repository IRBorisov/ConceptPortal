import { type BasicBinding, type RSEngine, type RSForm, type RSModel } from '@rsconcept/domain/library';
import { TYPE_BASIC } from '@rsconcept/domain/library/rsmodel';

import { PORTAL_JSON_CONTRACT_VERSION } from '@/features/library/models/portal-import-json';

import { type ConstituentaValue, type RSModelJsonDTO } from '../backend/types';

/** Build Portal model JSON import payload from current model and engine state. */
export function toRSModelImportJson(schema: RSForm, model: RSModel, engine: RSEngine): RSModelJsonDTO {
  const seen = new Set<number>();
  const items: ConstituentaValue[] = [];

  function pushItem(id: number, type: string, value: ConstituentaValue['value']) {
    if (seen.has(id)) {
      return;
    }
    seen.add(id);
    items.push({ id, type, value });
  }

  for (const item of model.items) {
    if (!schema.cstByID.has(item.id)) {
      continue;
    }
    if (item.type === TYPE_BASIC) {
      const binding = engine.basics.get(item.id) ?? (item.value as BasicBinding);
      if (Object.keys(binding).length > 0) {
        pushItem(item.id, TYPE_BASIC, binding);
      }
      continue;
    }
    const value = engine.getCstValue(item.id);
    if (value !== null) {
      pushItem(item.id, item.type, value);
    }
  }

  for (const [id, binding] of engine.basics) {
    if (!seen.has(id) && Object.keys(binding).length > 0) {
      pushItem(id, TYPE_BASIC, binding);
    }
  }

  return {
    contract_version: PORTAL_JSON_CONTRACT_VERSION,
    title: model.title,
    alias: model.alias,
    description: model.description,
    items
  };
}
