import {
  IconConceptBlock,
  IconDownload,
  IconReference,
  IconRSForm,
  IconRSFormImported,
  IconRSFormOwned,
  IconSynthesis
} from '@/components/icons';
import { cn } from '@/components/utils';
import { ValueStats } from '@/components/view';

import { type OperationSchemaStats } from '../models/oss';

interface OssStatsProps {
  className?: string;
  stats: OperationSchemaStats;
}

export function OssStats({ className, stats }: OssStatsProps) {
  return (
    <aside className={cn('grid grid-cols-3 gap-1 justify-items-end h-min select-none', className)}>
      <div id='count_operations' className='w-fit flex gap-3 hover:cursor-default col-span-2'>
        <span>Всего</span>
        <span className='font-math'>{stats.count_all}</span>
      </div>
      <ValueStats
        id='count_block' //
        title='Блоки'
        icon={<IconConceptBlock size='1.25rem' />}
        value={stats.count_block}
      />

      <ValueStats
        id='count_inputs'
        className='col-start-1'
        title='Загрузка'
        icon={<IconDownload size='1.25rem' />}
        value={stats.count_inputs}
      />
      <ValueStats
        id='count_synthesis'
        title='Синтез'
        icon={<IconSynthesis size='1.25rem' />}
        value={stats.count_synthesis}
      />
      <ValueStats
        id='count_references'
        title='Реплика'
        icon={<IconReference size='1.25rem' />}
        value={stats.count_references}
      />

      <ValueStats
        id='count_schemas'
        title='Прикрепленные схемы'
        icon={<IconRSForm size='1.25rem' />}
        value={stats.count_schemas}
      />
      <ValueStats
        id='count_owned'
        title='Собственные'
        icon={<IconRSFormOwned size='1.25rem' />}
        value={stats.count_owned}
      />
      <ValueStats
        id='count_imported'
        title='Внешние'
        icon={<IconRSFormImported size='1.25rem' />}
        value={stats.count_schemas - stats.count_owned}
      />
    </aside>
  );
}
