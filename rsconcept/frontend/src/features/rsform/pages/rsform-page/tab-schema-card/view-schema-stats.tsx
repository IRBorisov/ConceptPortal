import { type RSFormStats } from '@/domain/library';
import { useTx } from '@/i18n/use-tx';

import { Divider } from '@/components/container';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { StatsCategory } from '@/components/view/stats-category';

interface ViewSchemaStatsProps extends Styling {
  stats: RSFormStats;
}

export function ViewSchemaStats({ className, stats, ...restProps }: ViewSchemaStatsProps) {
  const tx = useTx();
  const countOwned = stats.count_all - stats.count_inherited;
  const countBase = stats.count_structured + stats.count_base;
  const countErrors = stats.count_incorrect + stats.count_incalculable;
  const countDerived = stats.count_all - stats.count_base - stats.count_nominal;

  return (
    <aside className={cn('h-fit flex flex-col border select-none', className)} {...restProps}>
      <StatsCategory
        id='stats-overview'
        className='rounded-t-md'
        label={tx('ui.stats.section.overview', 'Overall composition')}
        primaryLabel={tx('ui.stats.primary.constituents', 'Constituents')}
        primaryValue={stats.count_all}
        primaryTitle={tx('ui.stats.title.totalConstituents', 'Total constituent count')}
        secondaryLabel={stats.count_inherited > 0 ? tx('ui.stats.secondary.owned', 'Own') : undefined}
        secondaryValue={stats.count_inherited > 0 ? countOwned : undefined}
        secondaryTitle={tx('ui.stats.title.ownedConstituents', 'Number of own constituents')}
        details={[
          { label: tx('ui.stats.row.totalConstituents', 'Total constituents'), value: stats.count_all },
          ...(stats.count_inherited > 0
            ? [
                { label: tx('ui.stats.row.inherited', 'Inherited'), value: stats.count_inherited },
                { label: tx('ui.stats.row.owned', 'Own'), value: countOwned }
              ]
            : []),
          { label: tx('ui.stats.row.crucial', 'Crucial'), value: stats.count_crucial },
          { label: tx('ui.stats.row.termLabels', 'Terms'), value: stats.count_term },
          { label: tx('ui.stats.row.definitions', 'Definitions'), value: stats.count_definition },
          { label: tx('ui.stats.row.conventions', 'Conventions'), value: stats.count_convention },
          { label: tx('ui.stats.row.comments', 'Comments'), value: stats.count_comment }
        ]}
      />

      <Divider margins='mx-3' />

      <StatsCategory
        id='stats-structures'
        label={tx('ui.stats.schema.coreProfile', 'Core profile')}
        primaryLabel={tx('ui.stats.primary.bases', 'Base items')}
        primaryValue={countBase}
        primaryTitle={tx('ui.stats.title.undefinedConcepts', 'Count of undefined concepts')}
        secondaryLabel={tx('ui.stats.secondary.complexity', 'Complexity')}
        secondaryValue={stats.step_complexity}
        secondaryTitle={tx('ui.stats.title.termsForBases', 'Number of terms describing base concepts')}
        details={[
          { label: tx('ui.stats.row.nominals', 'Nominals'), value: stats.count_nominal },
          { label: tx('ui.stats.row.baseSets', 'Base sets'), value: stats.count_base },
          { label: tx('ui.stats.row.constantSets', 'Constant sets'), value: stats.count_constant },
          { label: tx('ui.stats.row.genericStructures', 'Generic structures'), value: stats.count_structured },
          { label: tx('ui.stats.row.axioms', 'Axioms'), value: stats.count_axiom }
        ]}
      />

      <Divider margins='mx-3' />

      <StatsCategory
        id='stats-logics'
        label={tx('ui.stats.schema.bodyProfile', 'Body profile')}
        primaryLabel={tx('ui.stats.primary.derived', 'Derived')}
        primaryValue={countDerived}
        primaryTitle={tx('ui.stats.title.derivedConcepts', 'Count of derived concepts and statements')}
        secondaryLabel={tx('ui.stats.secondary.functions', 'Functions')}
        secondaryValue={stats.count_function + stats.count_predicate}
        secondaryTitle={tx('ui.stats.title.termAndPredicateFns', 'Count of term and predicate functions')}
        details={[
          { label: tx('ui.stats.row.terms', 'Terms'), value: stats.count_term },
          { label: tx('ui.stats.row.termFunctions', 'Term functions'), value: stats.count_function },
          { label: tx('ui.stats.row.predicateFunctions', 'Predicate functions'), value: stats.count_predicate },
          { label: tx('ui.stats.row.theorems', 'Theorems'), value: stats.count_theorem }
        ]}
      />

      <Divider margins='mx-3' />

      <StatsCategory
        id='stats-quality'
        className='rounded-b-md'
        label={tx('ui.stats.section.correctness', 'Correctness')}
        primaryLabel={tx('ui.stats.primary.problems', 'Issues')}
        primaryValue={stats.count_problematic}
        primaryTitle={tx('ui.stats.title.problemsCount', 'Number of issues including errors, homonyms and duplicates')}
        secondaryLabel={tx('ui.stats.secondary.errors', 'Errors')}
        secondaryValue={countErrors}
        secondaryTitle={tx(
          'ui.stats.title.errorDefinitions',
          'Erroneous definitions, including syntax, semantics and interpretation errors'
        )}
        details={[
          { label: tx('ui.stats.row.homonyms', 'Homonyms'), value: stats.count_homonyms },
          { label: tx('ui.stats.row.duplicates', 'Duplicates'), value: stats.count_formal_duplicates },
          {
            label: tx('ui.stats.row.missingConventionOrTerm', 'Missing convention or term'),
            value: stats.count_missing_convention
          },
          { label: tx('ui.stats.row.syntaxErrors', 'Syntax errors'), value: stats.count_failed_parse },
          { label: tx('ui.stats.row.semanticErrors', 'Semantic errors'), value: stats.count_incorrect },
          { label: tx('ui.stats.row.nonDimensional', 'Non-dimensional'), value: stats.count_property },
          { label: tx('ui.stats.row.incalculable', 'Incalculable'), value: stats.count_incalculable }
        ]}
      />
    </aside>
  );
}
