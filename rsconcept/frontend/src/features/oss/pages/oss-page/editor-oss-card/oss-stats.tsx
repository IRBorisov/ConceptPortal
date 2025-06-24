import {
  IconConceptBlock,
  IconDownload,
  IconRSForm,
  IconRSFormImported,
  IconRSFormOwned,
  IconSynthesis
} from '@/components/icons';
import { cn } from '@/components/utils';
import { ValueStats } from '@/components/view';

import { type IOperationSchemaStats } from '../../../models/oss';

interface OssStatsProps {
  className?: string;
  isMounted: boolean;
  stats: IOperationSchemaStats;
}

export function OssStats({ className, isMounted, stats }: OssStatsProps) {
  return (
    <aside
      className={cn(
        'grid grid-cols-4 gap-1 justify-items-end h-min',
        'cc-animate-sidebar',
        isMounted ? 'max-w-full' : 'opacity-0 max-w-0',
        className
      )}
    >
      <div id='count_operations' className='w-fit flex gap-3 hover:cursor-default '>
        <span>Всего</span>
        <span>{stats.count_all}</span>
      </div>
      <ValueStats id='count_block' title='Блоки' icon={<IconConceptBlock size='1.25rem' />} value={stats.count_block} />
      <ValueStats
        id='count_inputs'
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
