import { type OperationSchemaStats } from '@/domain/library';

import { cn } from '@/components/utils';
import { StatsCategory } from '@/components/view/stats-category';

interface OssStatsProps {
  className?: string;
  stats: OperationSchemaStats;
}

export function OssStats({ className, stats }: OssStatsProps) {
  const countImported = stats.count_schemas - stats.count_owned;

  return (
    <div className={cn('select-none', 'flex flex-col gap-2', className)}>
      <StatsCategory
        id='oss-stats-composition'
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

      <StatsCategory
        id='oss-stats-schemas'
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
    </div>
  );
}
