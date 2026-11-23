function calculate(model, data) {
  const { engine, items, mode } = model;
  if (data) engine.loadData(engine.schema, structuredClone(data));
  engine[mode]();
  engine.flushPendingChanges();
  return items.map(({ id }) => [id, engine.getCstStatus(id), engine.getCstValue(id)]);
}

function changed(model, index, edit) {
  const updated = structuredClone(model);
  edit(updated.items[index], updated.items);
  return updated;
}

export async function runPortalCases({ check, reference, candidate, readSnapshot, portalMode }) {
  if (!readSnapshot || !reference.prepare || !candidate.prepare) {
    throw new Error('The Portal suite requires a saved snapshot and two Portal adapter bundles');
  }

  const manifest = await readSnapshot('manifest.json');
  if (!manifest.models?.length) throw new Error('The snapshot contains no models');
  for (const entry of manifest.models) {
    const schema = await readSnapshot(entry.schema.file);
    const model = await readSnapshot(entry.model.file);
    const fixtures = [
      [reference, 'recalculateAll'],
      [candidate, portalMode]
    ].map(([runtime, mode]) => {
      const prepare = (schema, data) => runtime.prepare(structuredClone(schema), structuredClone(data));
      const fixture = prepare(schema, model);
      return { ...fixture, engine: fixture.load(), prepare, mode };
    });
    const [baseline, test] = fixtures;
    function compare(id, data) {
      const expected = calculate(baseline, data);
      check(`portal.${entry.id}.${id}`, () => calculate(test, data), expected);
    }
    compare('first');
    compare('unchanged');
    compare('equivalent-reload', model);

    for (const [index, binding] of model.items.entries()) {
      const prefix = `binding-${binding.id}`;
      const compareEdit = (name, edit) => compare(`${prefix}.${name}`, changed(model, index, edit));
      const { value } = binding;
      if (binding.type === 'basic' && Object.keys(value).length > 0) {
        const key = Object.keys(value)[0];
        compareEdit('rename-label', item => {
          item.value[key] += ' audit';
        });
        compareEdit('remove-element', item => {
          delete item.value[key];
        });
        compare(`${prefix}.restored-elements`, model);
      } else if (Array.isArray(value) && value.length > 0) {
        compareEdit('remove-row', item => {
          item.value.pop();
        });
        if (value.length > 1) {
          compareEdit('reordered-rows', item => {
            [item.value[0], item.value[1]] = [item.value[1], item.value[0]];
          });
          compareEdit('duplicate-row', item => {
            item.value.splice(1, 0, item.value[0]);
          });
        }
        compareEdit('empty-relation', item => {
          item.value = [];
        });
        compare(`${prefix}.restored-rows`, model);
      } else if (typeof value === 'number') {
        compareEdit('update-scalar', item => {
          item.value += 1;
        });
        compare(`${prefix}.restored-scalar`, model);
      }
      compareEdit('deleted', (_item, items) => {
        items.splice(index, 1);
      });
      compare(`${prefix}.restored-binding`, model);
    }

    const term = baseline.calculatedItems.find(item => item.definition_formal.length > 0);
    if (term) {
      const edited = structuredClone(schema);
      edited.items.find(item => item.id === term.id).definition_formal = '(';
      for (const fixture of fixtures) {
        fixture.engine.loadData(fixture.prepare(edited, model).load().schema, structuredClone(model));
      }
      compare('invalid-expression');
      const expected = baseline.engine.calculateCst(term.id);
      check(`portal.${entry.id}.invalid-expression.details`, () => test.engine.calculateCst(term.id), expected);
      for (const fixture of fixtures) {
        fixture.engine.loadData(fixture.prepare(schema, model).load().schema, structuredClone(model));
      }
      compare('restored-expression');
    }
    for (const { id } of baseline.calculatedItems) {
      const expected = baseline.engine.calculateCst(id);
      check(`portal.${entry.id}.constituent-${id}.details`, () => test.engine.calculateCst(id), expected);
    }
  }
}
