import { type OperationSchemaStats } from '@/domain/library';

import { Divider } from '@/components/container';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { StatsCategory } from '@/components/view/stats-category';

interface ViewOssStatsProps extends Styling {
  stats: OperationSchemaStats;
}

export function ViewOssStats({ className, stats, ...restProps }: ViewOssStatsProps) {
  const countImported = stats.count_schemas - stats.count_owned;

  return (
    <aside className={cn('h-fit flex flex-col border select-none', className)} {...restProps}>
      <StatsCategory
        id='oss-stats-composition'
        className='rounded-t-md'
        label='Общий состав'
        primaryLabel='Всего'
        primaryValue={stats.count_all}
        primaryTitle='Общее количество элементов в составе операционной схемы'
        secondaryLabel={stats.count_block > 0 ? 'Блоки' : undefined}
        secondaryValue={stats.count_block > 0 ? stats.count_block : undefined}
        secondaryTitle='Количество вложенных блоков'
        details={[
          { label: 'Всего', value: stats.count_all },
          { label: 'Блоки', value: stats.count_block },
          { label: 'Загрузка', value: stats.count_inputs },
          { label: 'Синтез', value: stats.count_synthesis },
          { label: 'Реплика', value: stats.count_references }
        ]}
      />

      <Divider margins='mx-3' />

      <StatsCategory
        id='oss-stats-schemas'
        className='rounded-b-md'
        label='Прикреплённые схемы'
        primaryLabel='Всего'
        primaryValue={stats.count_schemas}
        primaryTitle='Количество операций с прикреплённой схемой RSForm'
        secondaryLabel={stats.count_schemas > 0 ? 'Собственные' : undefined}
        secondaryValue={stats.count_schemas > 0 ? stats.count_owned : undefined}
        secondaryTitle='Количество собственных (не импортированных) схем'
        details={[
          { label: 'Прикрепленные схемы', value: stats.count_schemas },
          { label: 'Собственные', value: stats.count_owned },
          { label: 'Внешние', value: countImported }
        ]}
      />
    </aside>
  );
}
