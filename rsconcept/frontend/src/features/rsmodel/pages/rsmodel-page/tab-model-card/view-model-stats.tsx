import { type RSModelStats } from '@/domain/library';
import { useTx } from '@/i18n';

import { Divider } from '@/components/container';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { StatsCategory } from '@/components/view/stats-category';

interface ViewModelStatsProps extends Styling {
  stats: RSModelStats;
}

export function ViewModelStats({ className, stats, ...restProps }: ViewModelStatsProps) {
  const tx = useTx();
  const countOwned = stats.count_all - stats.count_inherited;
  const countBase = stats.count_structured + stats.count_base;
  const countErrors = stats.count_incorrect + stats.count_incalculable;
  const countDerived = stats.count_all - stats.count_base - stats.count_nominal;
  const countModelNotes =
    stats.count_missing_base +
    stats.count_false_axioms +
    stats.count_invalid_data +
    stats.count_invalid_calculations +
    stats.count_empty_terms;

  return (
    <aside className={cn('h-fit flex flex-col border select-none', className)} {...restProps}>
      <StatsCategory
        id='rsmodel-stats-overview'
        className='rounded-t-md'
        label={tx('tx.lib.contents')}
        primaryLabel={tx('tx.cst.plural')}
        primaryValue={stats.count_all}
        primaryTitle={tx('tx.schema.items.total.hint')}
        secondaryLabel={stats.count_inherited > 0 ? tx('tx.concept.original.plural') : undefined}
        secondaryValue={stats.count_inherited > 0 ? countOwned : undefined}
        secondaryTitle={tx('tx.concept.original.hint')}
        details={[
          { label: tx('tx.general.total'), value: stats.count_all },
          ...(stats.count_inherited > 0
            ? [
                { label: tx('tx.concept.inherited.plural'), value: stats.count_inherited },
                { label: tx('tx.concept.original.plural'), value: countOwned }
              ]
            : []),
          { label: tx('tx.cst.crucial.plural'), value: stats.count_crucial },
          { label: tx('tx.lang.term.plural'), value: stats.count_text_term },
          { label: tx('tx.lib.definitionTextual.plural'), value: stats.count_definition },
          { label: tx('tx.lib.convention.plural'), value: stats.count_convention },
          { label: tx('tx.lib.comment.plural'), value: stats.count_comment }
        ]}
      />

      <Divider margins='mx-3' />

      <StatsCategory
        id='rsmodel-stats-structures'
        label={tx('tx.schema.short')}
        primaryLabel={tx('tx.concept.basic.plural')}
        primaryValue={countBase}
        primaryTitle={tx('ui.stats.title.undefinedConcepts')}
        secondaryLabel={tx('ui.stats.secondary.complexity')}
        secondaryValue={stats.step_complexity}
        secondaryTitle={tx('ui.stats.title.termsForBases')}
        details={[
          { label: tx('tx.concept.basic.plural'), value: countBase },
          { label: tx('tx.concept.derived.plural'), value: countDerived },
          { label: tx('tx.cst.type.nominal.plural'), value: stats.count_nominal },
          { label: tx('tx.cst.type.basic'), value: stats.count_base },
          { label: tx('tx.cst.type.constant'), value: stats.count_constant },
          { label: tx('tx.cst.type.structure'), value: stats.count_structured },
          { label: tx('tx.cst.type.axiom'), value: stats.count_axiom },
          { label: tx('tx.cst.type.term'), value: stats.count_term },
          { label: tx('tx.cst.type.function'), value: stats.count_function },
          { label: tx('tx.cst.type.predicate'), value: stats.count_predicate },
          { label: tx('tx.cst.type.theorem'), value: stats.count_theorem }
        ]}
      />

      <Divider margins='mx-3' />

      <StatsCategory
        id='rsmodel-stats-quality'
        label={tx('tx.concept.system.correctness.short')}
        primaryLabel={tx('tx.general.issue.plural')}
        primaryValue={stats.count_problematic}
        primaryTitle={tx('tx.schema.issue.hint')}
        secondaryLabel={tx('tx.general.error.plural')}
        secondaryValue={countErrors}
        secondaryTitle={tx('ui.stats.title.errorDefinitions')}
        details={[
          { label: tx('tx.concept.homonym.plural'), value: stats.count_homonyms },
          { label: tx('tx.concept.duplicate.plural'), value: stats.count_formal_duplicates },
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

      <Divider margins='mx-3' />

      <StatsCategory
        id='rsmodel-stats-model'
        className='rounded-b-md'
        label={tx('tx.model.short')}
        primaryLabel={tx('tx.general.issue.plural')}
        primaryValue={countModelNotes}
        primaryTitle={tx('tx.model.issue.hint')}
        secondaryLabel={tx('ui.stats.secondary.basePower')}
        secondaryValue={stats.base_elements}
        secondaryTitle={tx('ui.stats.title.baseInterpretationPower')}
        details={[
          { label: tx('ui.stats.row.baseCardinality'), value: stats.base_elements },
          { label: tx('tx.eval.status.invalidData'), value: stats.count_invalid_data },
          {
            label: tx('ui.stats.row.missingBaseInterpretation'),
            value: stats.count_missing_base
          },
          { label: tx('ui.stats.row.violatedAxioms'), value: stats.count_false_axioms },
          {
            label: tx('ui.stats.row.invalidCalculations'),
            value: stats.count_invalid_calculations
          },
          { label: tx('ui.stats.row.emptyTerms'), value: stats.count_empty_terms }
        ]}
      />
    </aside>
  );
}
