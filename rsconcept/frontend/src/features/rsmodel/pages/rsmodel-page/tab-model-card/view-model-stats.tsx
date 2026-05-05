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
        label={tx('ui.stats.section.overview')}
        primaryLabel={tx('tx.lib.cst.plural')}
        primaryValue={stats.count_all}
        primaryTitle={tx('ui.stats.title.totalConstituents')}
        secondaryLabel={stats.count_inherited > 0 ? tx('tx.lib.concept.original.plural') : undefined}
        secondaryValue={stats.count_inherited > 0 ? countOwned : undefined}
        secondaryTitle={tx('ui.stats.title.ownedConstituents')}
        details={[
          { label: tx('ui.stats.row.totalConstituents'), value: stats.count_all },
          ...(stats.count_inherited > 0
            ? [
                { label: tx('tx.lib.concept.inherited.plural'), value: stats.count_inherited },
                { label: tx('tx.lib.concept.original.plural'), value: countOwned }
              ]
            : []),
          { label: tx('tx.lib.cst.crucial.plural'), value: stats.count_crucial },
          { label: tx('tx.lib.term.plural'), value: stats.count_text_term },
          { label: tx('ui.stats.row.definitions'), value: stats.count_definition },
          { label: tx('ui.stats.row.conventions'), value: stats.count_convention },
          { label: tx('tx.lib.comment.plural'), value: stats.count_comment }
        ]}
      />

      <Divider margins='mx-3' />

      <StatsCategory
        id='rsmodel-stats-structures'
        label={tx('ui.stats.model.schemaProfile')}
        primaryLabel={tx('tx.lib.concept.basic.plural')}
        primaryValue={countBase}
        primaryTitle={tx('ui.stats.title.undefinedConcepts')}
        secondaryLabel={tx('ui.stats.secondary.complexity')}
        secondaryValue={stats.step_complexity}
        secondaryTitle={tx('ui.stats.title.termsForBases')}
        details={[
          { label: tx('tx.lib.concept.basic.plural'), value: countBase },
          { label: tx('tx.lib.concept.derived.plural'), value: countDerived },
          { label: tx('ui.stats.row.nominals'), value: stats.count_nominal },
          { label: tx('tx.lib.cst.type.basic'), value: stats.count_base },
          { label: tx('tx.lib.cst.type.constant'), value: stats.count_constant },
          { label: tx('tx.lib.cst.type.structure'), value: stats.count_structured },
          { label: tx('tx.lib.cst.type.axiom'), value: stats.count_axiom },
          { label: tx('tx.lib.cst.type.term'), value: stats.count_term },
          { label: tx('tx.lib.cst.type.function'), value: stats.count_function },
          { label: tx('tx.lib.cst.type.predicate'), value: stats.count_predicate },
          { label: tx('tx.lib.cst.type.theorem'), value: stats.count_theorem }
        ]}
      />

      <Divider margins='mx-3' />

      <StatsCategory
        id='rsmodel-stats-quality'
        label={tx('ui.stats.section.correctness')}
        primaryLabel={tx('ui.stats.primary.problems')}
        primaryValue={stats.count_problematic}
        primaryTitle={tx('ui.stats.title.problemsCount')}
        secondaryLabel={tx('tx.general.error.plural')}
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

      <Divider margins='mx-3' />

      <StatsCategory
        id='rsmodel-stats-model'
        className='rounded-b-md'
        label={tx('ui.stats.model.profile')}
        primaryLabel={tx('ui.stats.primary.remarks')}
        primaryValue={countModelNotes}
        primaryTitle={tx('ui.stats.title.remarksSum')}
        secondaryLabel={tx('ui.stats.secondary.basePower')}
        secondaryValue={stats.base_elements}
        secondaryTitle={tx('ui.stats.title.baseInterpretationPower')}
        details={[
          { label: tx('ui.stats.row.baseCardinality'), value: stats.base_elements },
          { label: tx('tx.lib.evalStatus.invalidData'), value: stats.count_invalid_data },
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
