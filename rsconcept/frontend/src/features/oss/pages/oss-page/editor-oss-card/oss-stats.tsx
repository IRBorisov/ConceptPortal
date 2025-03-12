import clsx from 'clsx';

import { IconDownload, IconRSForm, IconRSFormImported, IconRSFormOwned, IconSynthesis } from '@/components/icons1';
import { ValueStats } from '@/components/view1';

import { type IOperationSchemaStats } from '../../../models/oss';

interface OssStatsProps {
  className?: string;
  stats: IOperationSchemaStats;
}

export function OssStats({ className, stats }: OssStatsProps) {
  return (
    <div className={clsx('grid grid-cols-3 gap-1 justify-items-end', className)}>
      <div id='count_operations' className='w-fit flex gap-3 hover:cursor-default '>
        <span>Всего</span>
        <span>{stats.count_operations}</span>
      </div>
      <ValueStats
        id='count_inputs'
        icon={<IconDownload size='1.25rem' className='text-sec-600' />}
        value={stats.count_inputs}
        title='Загрузка'
      />
      <ValueStats
        id='count_synthesis'
        icon={<IconSynthesis size='1.25rem' className='text-sec-600' />}
        value={stats.count_synthesis}
        title='Синтез'
      />

      <ValueStats
        id='count_schemas'
        icon={<IconRSForm size='1.25rem' className='text-sec-600' />}
        value={stats.count_schemas}
        title='Прикрепленные схемы'
      />
      <ValueStats
        id='count_owned'
        icon={<IconRSFormOwned size='1.25rem' className='text-sec-600' />}
        value={stats.count_owned}
        title='Собственные'
      />
      <ValueStats
        id='count_imported'
        icon={<IconRSFormImported size='1.25rem' className='text-sec-600' />}
        value={stats.count_schemas - stats.count_owned}
        title='Внешние'
      />
    </div>
  );
}
