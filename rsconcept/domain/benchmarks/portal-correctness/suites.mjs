import { makeChecks } from './check.mjs';
import { runGraphCases } from './graph-cases.mjs';
import { runModelCases } from './model-cases.mjs';
import { runPortalCases } from './portal-cases.mjs';
import { runRelationalCases } from './relational-cases.mjs';
import { runTypedCases } from './typed-cases.mjs';

const suites = {
  model: runModelCases,
  graph: runGraphCases,
  relational: runRelationalCases,
  typed: runTypedCases,
  portal: runPortalCases
};

const experimentSuites = { runRounds: 'graph', relational: 'typed', minesD4: 'typed' };

export async function runSuites(options) {
  const checks = makeChecks();
  const { check, failures } = checks;
  const chosen = options.suites ?? Object.keys(suites).filter(name => name !== 'portal' || options.readSnapshot);
  if (chosen.length === 0) throw new Error('Select at least one correctness suite');
  const groups = {};
  const experiments = {};
  const accepted = new Map();
  if (options.experiments) {
    for (const [hook, suite] of Object.entries(experimentSuites)) {
      const run = options.experiments[hook];
      if (!chosen.includes(suite) || run === undefined) continue;
      if (typeof run !== 'function') throw new Error(`Experiment hook ${hook} must be a function`);
      accepted.set(hook, 0);
      experiments[hook] = args => {
        const result = run(args);
        if (result !== undefined) accepted.set(hook, accepted.get(hook) + 1);
        return result;
      };
    }
    if (accepted.size === 0) throw new Error('The experiment module provides no hooks for the selected suites');
  }
  for (const name of chosen) {
    if (!Object.hasOwn(suites, name)) throw new Error(`Unknown suite: ${name}`);
    if (Object.hasOwn(groups, name)) throw new Error(`Repeated suite: ${name}`);
    const first = checks.total;
    const before = failures.length;
    try {
      await suites[name]({ ...options, experiments, check });
      for (const [hook, count] of accepted) {
        if (experimentSuites[hook] === name) check(`experiment.${hook}.accepted-a-fixture`, count > 0, true);
      }
      if (checks.total === first) check(`${name}.empty`, false, true);
    } catch (error) {
      check(`${name}.suite-error`, String(error), 'suite completes');
    }
    groups[name] = { total: checks.total - first, failed: failures.length - before };
  }
  return { total: checks.total, groups, failures };
}
