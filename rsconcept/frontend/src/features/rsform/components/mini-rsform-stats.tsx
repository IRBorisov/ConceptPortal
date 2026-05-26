'use client';

import { type RSFormStats } from '@rsconcept/domain/library';
import { useTx } from '@/i18n';

import {
  IconChild,
  IconConvention,
  IconCrucial,
  IconCstAxiom,
  IconCstBaseSet,
  IconCstConstSet,
  IconCstFunction,
  IconCstNominal,
  IconCstPredicate,
  IconCstStructured,
  IconCstTerm,
  IconDefinition,
  IconPredecessor,
  IconStatusError,
  IconStatusIncalculable,
  IconStatusProperty,
  IconTerminology
} from '@/components/icons';
import { cn } from '@/components/utils';
import { ValueStats } from '@/components/view';

interface MiniRSFormStatsProps {
  className?: string;
  stats: RSFormStats;
}

export function MiniRSFormStats({ className, stats }: MiniRSFormStatsProps) {
  const tx = useTx();

  return (
    <div className={cn('h-min', 'grid grid-cols-4 gap-1 justify-items-end select-none', className)}>
      <div id='count_all' className='col-span-2 w-fit flex gap-3 hover:cursor-default'>
        <span>{tx('tx.general.total')}</span>
        <span className='font-math'>{stats.count_all}</span>
      </div>
      <ValueStats
        id='count_owned'
        title={tx('tx.cst.original.plural.short')}
        icon={<IconPredecessor size='1.25rem' />}
        value={stats.count_all - stats.count_inherited}
      />
      <ValueStats
        id='count_inherited'
        icon={<IconChild size='1.25rem' />}
        value={stats.count_inherited}
        title={tx('tx.concept.inherited.plural')}
      />

      <ValueStats
        id='count_nominal'
        title={tx('tx.cst.type.nominal.plural')}
        icon={<IconCstNominal size='1.25rem' className={stats.count_nominal > 0 ? 'text-destructive' : undefined} />}
        value={stats.count_nominal}
      />

      <ValueStats
        id='count_base'
        title={tx('tx.cst.type.basic')}
        icon={<IconCstBaseSet size='1.25rem' />}
        value={stats.count_base}
      />
      <ValueStats
        id='count_constant'
        title={tx('tx.cst.type.constant')}
        icon={<IconCstConstSet size='1.25rem' />}
        value={stats.count_constant}
      />
      <ValueStats
        id='count_structured'
        title={tx('tx.cst.type.structure')}
        icon={<IconCstStructured size='1.25rem' />}
        value={stats.count_structured}
      />

      <ValueStats
        id='count_axiom'
        title={tx('tx.cst.type.axiom')}
        icon={<IconCstAxiom size='1.25rem' />}
        value={stats.count_axiom}
      />
      <ValueStats
        id='count_term'
        title={tx('tx.cst.type.term')}
        icon={<IconCstTerm size='1.25rem' />}
        value={stats.count_term}
      />
      <ValueStats
        id='count_function'
        title={tx('tx.cst.type.function')}
        icon={<IconCstFunction size='1.25rem' />}
        value={stats.count_function}
      />
      <ValueStats
        id='count_predicate'
        title={tx('tx.cst.type.predicate')}
        icon={<IconCstPredicate size='1.25rem' />}
        value={stats.count_predicate}
      />

      <ValueStats
        id='count_property'
        title={tx('tx.parse.status.property.hint')}
        icon={<IconStatusProperty size='1.25rem' />}
        value={stats.count_property}
      />
      <ValueStats
        id='count_incalculable'
        title={tx('tx.parse.status.incalculable.hint')}
        icon={<IconStatusIncalculable size='1.25rem' />}
        value={stats.count_incalculable}
      />
      <ValueStats
        id='count_incorrect '
        title={tx('tx.parse.status.incorrect.hint')}
        icon={<IconStatusError size='1.25rem' className={stats.count_incorrect > 0 ? 'text-destructive' : undefined} />}
        value={stats.count_incorrect}
      />
      <ValueStats
        id='count_type_mismatch'
        title={tx('tx.schema.issue.typeMismatch.hint')}
        icon={
          <IconStatusError size='1.25rem' className={stats.count_type_mismatch > 0 ? 'text-destructive' : undefined} />
        }
        value={stats.count_type_mismatch}
      />

      <ValueStats
        id='count_crucial'
        title={tx('tx.cst.crucial.plural')}
        icon={<IconCrucial size='1.25rem' />}
        value={stats.count_crucial}
      />
      <ValueStats
        id='count_text_term'
        title={tx('tx.lang.term.plural')}
        icon={<IconTerminology size='1.25rem' />}
        value={stats.count_text_term}
      />
      <ValueStats
        id='count_definition'
        title={tx('tx.lib.defineText.plural')}
        icon={<IconDefinition size='1.25rem' />}
        value={stats.count_definition}
      />
      <ValueStats
        id='count_convention'
        title={tx('tx.lib.convention.plural')}
        icon={
          <IconConvention
            size='1.25rem'
            className={
              stats.count_convention < stats.count_structured + stats.count_base ? 'text-destructive' : undefined
            }
          />
        }
        value={stats.count_convention}
      />
    </div>
  );
}
