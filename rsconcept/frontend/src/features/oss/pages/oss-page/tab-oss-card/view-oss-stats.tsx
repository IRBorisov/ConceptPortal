'use client';

import { type OperationSchemaStats } from '@/domain/library';
import { useTx } from '@/i18n';

import { Divider } from '@/components/container';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { StatsCategory } from '@/components/view/stats-category';

interface ViewOssStatsProps extends Styling {
  stats: OperationSchemaStats;
}

export function ViewOssStats({ className, stats, ...restProps }: ViewOssStatsProps) {
  const tx = useTx();
  const countImported = stats.count_schemas - stats.count_owned;

  return (
    <aside className={cn('h-fit flex flex-col border select-none', className)} {...restProps}>
      <StatsCategory
        id='oss-stats-composition'
        className='rounded-t-md'
        label={tx('ui.stats.section.overview')}
        primaryLabel={tx('tx.general.total')}
        primaryValue={stats.count_all}
        primaryTitle={tx('ui.stats.oss.compositionPrimaryTitle')}
        secondaryLabel={stats.count_block > 0 ? tx('tx.lib.block.plural') : undefined}
        secondaryValue={stats.count_block > 0 ? stats.count_block : undefined}
        secondaryTitle={tx('ui.stats.oss.blocksSecondaryTitle')}
        details={[
          { label: tx('tx.general.total'), value: stats.count_all },
          { label: tx('tx.lib.block.plural'), value: stats.count_block },
          { label: tx('tx.lib.input'), value: stats.count_inputs },
          { label: tx('tx.lib.synthesis'), value: stats.count_synthesis },
          { label: tx('tx.lib.replica'), value: stats.count_references }
        ]}
      />

      <Divider margins='mx-3' />

      <StatsCategory
        id='oss-stats-schemas'
        className='rounded-b-md'
        label={tx('tx.lib.oss.attachedSchema.plural')}
        primaryLabel={tx('tx.general.total')}
        primaryValue={stats.count_schemas}
        primaryTitle={tx('ui.stats.oss.attachedPrimaryTitle')}
        secondaryLabel={stats.count_schemas > 0 ? tx('tx.lib.concept.original.plural') : undefined}
        secondaryValue={stats.count_schemas > 0 ? stats.count_owned : undefined}
        secondaryTitle={tx('ui.stats.oss.ownedSecondaryTitle')}
        details={[
          { label: tx('tx.lib.oss.attachedSchema.plural'), value: stats.count_schemas },
          { label: tx('tx.lib.concept.original.plural'), value: stats.count_owned },
          { label: tx('ui.stats.oss.detail.external'), value: countImported }
        ]}
      />
    </aside>
  );
}
