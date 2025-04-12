import { IconDownload, IconRSForm, IconRSFormImported, IconRSFormOwned, IconSynthesis } from '@/components/icons';
import { cn } from '@/components/utils';
import { ValueStats } from '@/components/view';

import { type IOperationSchemaStats } from '../../../models/oss';

interface OssStatsProps {
  className?: string;
  stats: IOperationSchemaStats;
}

export function OssStats({ className, stats }: OssStatsProps) {
  return (
    <div className={cn('grid grid-cols-3 gap-1 justify-items-end', className)}>
      <div id='count_operations' className='w-fit flex gap-3 hover:cursor-default '>
        <span>Всего</span>
        <span>{stats.count_operations}</span>
      </div>
      <ValueStats
        id='count_inputs'
        title='Загрузка'
        icon={<IconDownload size='1.25rem' className='text-primary' />}
        value={stats.count_inputs}
      />
      <ValueStats
        id='count_synthesis'
        title='Синтез'
        icon={<IconSynthesis size='1.25rem' className='text-primary' />}
        value={stats.count_synthesis}
      />

      <ValueStats
        id='count_schemas'
        title='Прикрепленные схемы'
        icon={<IconRSForm size='1.25rem' className='text-primary' />}
        value={stats.count_schemas}
      />
      <ValueStats
        id='count_owned'
        title='Собственные'
        icon={<IconRSFormOwned size='1.25rem' className='text-primary' />}
        value={stats.count_owned}
      />
      <ValueStats
        id='count_imported'
        title='Внешние'
        icon={<IconRSFormImported size='1.25rem' className='text-primary' />}
        value={stats.count_schemas - stats.count_owned}
      />
    </div>
  );
}
