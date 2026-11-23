import { RSEngine } from '@rsconcept/domain/library/rsengine';
import { isInferrable } from '@rsconcept/domain/library/rsmodel-api';

import { loadRSForm } from '../src/features/rsform/backend/rsform-loader.ts';

const services = {
  setCstValue: () => {
    throw new Error('The Portal corpus is read only');
  },
  clearValues: () => {
    throw new Error('The Portal corpus is read only');
  }
};

export function prepare(schemaDetails, modelDetails) {
  if (modelDetails.schema !== schemaDetails.id) throw new Error('Model and schema IDs differ');
  const schema = loadRSForm(schemaDetails);
  return {
    items: schema.items,
    calculatedItems: schema.items.filter(item => isInferrable(item.cst_type)),
    load() {
      const engine = new RSEngine(modelDetails.id, services);
      engine.loadData(schema, modelDetails);
      engine.flushPendingChanges();
      return engine;
    }
  };
}
