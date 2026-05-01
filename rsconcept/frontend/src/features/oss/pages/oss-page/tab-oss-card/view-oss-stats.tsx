'use client';

import { type OperationSchemaStats } from '@/domain/library';
import { useTx } from '@/i18n/use-tx';

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
        label={tx('ui.stats.section.overview', 'Overview')}
        primaryLabel={tx('ui.stats.caption.total', 'Total')}
        primaryValue={stats.count_all}
        primaryTitle={tx('ui.stats.oss.compositionPrimaryTitle', 'Total number of items in the operational schema')}
        secondaryLabel={stats.count_block > 0 ? tx('ui.stats.oss.blocks', 'Blocks') : undefined}
        secondaryValue={stats.count_block > 0 ? stats.count_block : undefined}
        secondaryTitle={tx('ui.stats.oss.blocksSecondaryTitle', 'Number of nested blocks')}
        details={[
          { label: tx('ui.stats.caption.total', 'Total'), value: stats.count_all },
          { label: tx('ui.stats.oss.blocks', 'Blocks'), value: stats.count_block },
          { label: tx('ui.stats.oss.detail.inputs', 'Input'), value: stats.count_inputs },
          { label: tx('ui.stats.oss.detail.synthesis', 'Synthesis'), value: stats.count_synthesis },
          { label: tx('ui.stats.oss.detail.replica', 'Replica'), value: stats.count_references }
        ]}
      />

      <Divider margins='mx-3' />

      <StatsCategory
        id='oss-stats-schemas'
        className='rounded-b-md'
        label={tx('ui.stats.oss.attachedSection', 'Attached schemas')}
        primaryLabel={tx('ui.stats.caption.total', 'Total')}
        primaryValue={stats.count_schemas}
        primaryTitle={tx('ui.stats.oss.attachedPrimaryTitle', 'Number of operations with an attached RSForm schema')}
        secondaryLabel={stats.count_schemas > 0 ? tx('ui.stats.secondary.owned', 'Owned') : undefined}
        secondaryValue={stats.count_schemas > 0 ? stats.count_owned : undefined}
        secondaryTitle={tx('ui.stats.oss.ownedSecondaryTitle', 'Number of owned (non-imported) schemas')}
        details={[
          { label: tx('ui.stats.oss.detail.attachedSchemas', 'Attached schemas'), value: stats.count_schemas },
          { label: tx('ui.stats.secondary.owned', 'Owned'), value: stats.count_owned },
          { label: tx('ui.stats.oss.detail.external', 'External'), value: countImported }
        ]}
      />
    </aside>
  );
}
