import Divider from '@/components/ui/Divider';
import ValueLabeled from '@/components/ui/ValueLabeled';
import { IOperationSchemaStats } from '@/models/oss';

interface OssStatsProps {
  stats?: IOperationSchemaStats;
}

function OssStats({ stats }: OssStatsProps) {
  if (!stats) {
    return null;
  }
  return (
    <div className='flex flex-col sm:gap-1 sm:ml-6 sm:mt-8 sm:w-[16rem]'>
      <Divider margins='my-2' className='sm:hidden' />

      <ValueLabeled id='count_all' label='Всего операций' text={stats.count_operations} />
      <ValueLabeled id='count_inputs' label='Загрузка' text={stats.count_inputs} />
      <ValueLabeled id='count_synthesis' label='Синтез' text={stats.count_synthesis} />

      <Divider margins='my-2' />

      <ValueLabeled id='count_schemas' label='Прикрепленные схемы' text={stats.count_schemas} />
    </div>
  );
}

export default OssStats;
