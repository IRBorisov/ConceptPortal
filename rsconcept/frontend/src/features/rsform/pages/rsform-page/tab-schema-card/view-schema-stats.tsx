import { type RSFormStats } from '@/domain/library';
import { useTx } from '@/i18n';

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
        label={tx('ui.stats.section.overview')}
        primaryLabel={tx('semantic.term.constituenta.plural')}
        primaryValue={stats.count_all}
        primaryTitle={tx('ui.stats.title.totalConstituents')}
        secondaryLabel={stats.count_inherited > 0 ? tx('ui.stats.secondary.owned') : undefined}
        secondaryValue={stats.count_inherited > 0 ? countOwned : undefined}
        secondaryTitle={tx('ui.stats.title.ownedConstituents')}
        details={[
          { label: tx('ui.stats.row.totalConstituents'), value: stats.count_all },
          ...(stats.count_inherited > 0
            ? [
                { label: tx('ui.stats.row.inherited'), value: stats.count_inherited },
                { label: tx('ui.stats.row.owned'), value: countOwned }
              ]
            : []),
          { label: tx('ui.stats.row.crucial'), value: stats.count_crucial },
          { label: tx('ui.stats.row.termLabels'), value: stats.count_term },
          { label: tx('ui.stats.row.definitions'), value: stats.count_definition },
          { label: tx('ui.stats.row.conventions'), value: stats.count_convention },
          { label: tx('ui.stats.row.comments'), value: stats.count_comment }
        ]}
      />

      <Divider margins='mx-3' />

      <StatsCategory
        id='stats-structures'
        label={tx('ui.stats.schema.coreProfile')}
        primaryLabel={tx('ui.stats.primary.bases')}
        primaryValue={countBase}
        primaryTitle={tx('ui.stats.title.undefinedConcepts')}
        secondaryLabel={tx('ui.stats.secondary.complexity')}
        secondaryValue={stats.step_complexity}
        secondaryTitle={tx('ui.stats.title.termsForBases')}
        details={[
          { label: tx('ui.stats.row.nominals'), value: stats.count_nominal },
          { label: tx('ui.stats.row.baseSets'), value: stats.count_base },
          { label: tx('ui.stats.row.constantSets'), value: stats.count_constant },
          { label: tx('ui.stats.row.genericStructures'), value: stats.count_structured },
          { label: tx('ui.stats.row.axioms'), value: stats.count_axiom }
        ]}
      />

      <Divider margins='mx-3' />

      <StatsCategory
        id='stats-logics'
        label={tx('ui.stats.schema.bodyProfile')}
        primaryLabel={tx('ui.stats.primary.derived')}
        primaryValue={countDerived}
        primaryTitle={tx('ui.stats.title.derivedConcepts')}
        secondaryLabel={tx('ui.stats.secondary.functions')}
        secondaryValue={stats.count_function + stats.count_predicate}
        secondaryTitle={tx('ui.stats.title.termAndPredicateFns')}
        details={[
          { label: tx('ui.stats.row.terms'), value: stats.count_term },
          { label: tx('ui.stats.row.termFunctions'), value: stats.count_function },
          { label: tx('ui.stats.row.predicateFunctions'), value: stats.count_predicate },
          { label: tx('ui.stats.row.theorems'), value: stats.count_theorem }
        ]}
      />

      <Divider margins='mx-3' />

      <StatsCategory
        id='stats-quality'
        className='rounded-b-md'
        label={tx('ui.stats.section.correctness')}
        primaryLabel={tx('ui.stats.primary.problems')}
        primaryValue={stats.count_problematic}
        primaryTitle={tx('ui.stats.title.problemsCount')}
        secondaryLabel={tx('ui.stats.secondary.errors')}
        secondaryValue={countErrors}
        secondaryTitle={tx('ui.stats.title.errorDefinitions')}
        details={[
          { label: tx('ui.stats.row.homonyms'), value: stats.count_homonyms },
          { label: tx('ui.stats.row.duplicates'), value: stats.count_formal_duplicates },
          {
            label: tx('ui.stats.row.missingConventionOrTerm'),
            value: stats.count_missing_convention
          },
          { label: tx('ui.stats.row.syntaxErrors'), value: stats.count_failed_parse },
          { label: tx('ui.stats.row.semanticErrors'), value: stats.count_incorrect },
          { label: tx('ui.stats.row.nonDimensional'), value: stats.count_property },
          { label: tx('ui.stats.row.incalculable'), value: stats.count_incalculable }
        ]}
      />
    </aside>
  );
}
