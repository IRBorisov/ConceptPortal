import {
  IconChild,
  IconConvention,
  IconDefinition,
  IconPredecessor,
  IconStatusError,
  IconStatusIncalculable,
  IconStatusOK,
  IconStatusProperty,
  IconTerminology
} from '@/components/Icons';
import ValueStats from '@/components/ui/ValueStats';
import { type IRSFormStats } from '@/models/rsform';

interface RSFormStatsProps {
  stats?: IRSFormStats;
}

function RSFormStats({ stats }: RSFormStatsProps) {
  if (!stats) {
    return null;
  }
  return (
    <div className='flex flex-col mt-3 md:gap-1 md:ml-6 md:mt-8 md:w-[18rem] w-[25rem]'>
      <div className='grid grid-cols-4 gap-1 mb-3 justify-items-end'>
        <div className='col-span-2 w-fit flex gap-3'>
          <span>Всего</span>
          <span>{stats.count_all}</span>
        </div>
        <ValueStats
          id='count_owned'
          icon={<IconPredecessor size='1.25rem' className='clr-text-primary' />}
          value={stats.count_all - stats.count_inherited}
          title='Собственные'
        />
        <ValueStats
          id='count_inherited'
          icon={<IconChild size='1.25rem' className='clr-text-primary' />}
          value={stats.count_inherited}
          title='Наследованные'
        />

        <ValueStats
          className='col-start-1'
          id='count_ok'
          icon={<IconStatusOK size='1.25rem' className='clr-text-green' />}
          value={stats.count_all - stats.count_errors - stats.count_property - stats.count_incalculable}
          title='Корректные'
        />
        <ValueStats
          id='count_property'
          icon={<IconStatusProperty size='1.25rem' className='clr-text-primary' />}
          value={stats.count_errors}
          title='Неразмерные'
        />
        <ValueStats
          id='count_incalculable'
          icon={<IconStatusIncalculable size='1.25rem' className='clr-text-red' />}
          value={stats.count_incalculable}
          title='Невычислимые'
        />
        <ValueStats
          id='count_errors'
          icon={<IconStatusError size='1.25rem' className='clr-text-red' />}
          value={stats.count_errors}
          title='Некорректные'
        />

        <ValueStats
          id='count_base'
          icon={<span className='font-math clr-text-default md:pr-1 pl-1 md:pl-0'>X</span>}
          value={stats.count_base}
          title='Базисные множества'
        />
        <ValueStats
          id='count_constant'
          icon={<span className='font-math clr-text-default md:pr-1 pl-1 md:pl-0'>C</span>}
          value={stats.count_constant}
          title='Константные множества'
        />
        <ValueStats
          id='count_structured'
          icon={<span className='font-math clr-text-default md:pr-1 pl-1 md:pl-0'>S</span>}
          value={stats.count_structured}
          title='Родовые структуры'
        />
        <ValueStats
          id='count_axiom'
          icon={<span className='font-math clr-text-default md:pr-1 pl-1 md:pl-0'>A</span>}
          value={stats.count_axiom}
          title='Аксиомы'
        />

        <ValueStats
          id='count_term'
          icon={<span className='font-math clr-text-default md:pr-1 pl-1 md:pl-0'>D</span>}
          value={stats.count_term}
          title='Термы'
        />
        <ValueStats
          id='count_function'
          icon={<span className='font-math clr-text-default md:pr-1 pl-1 md:pl-0'>F</span>}
          value={stats.count_function}
          title='Терм-функции'
        />
        <ValueStats
          id='count_predicate'
          icon={<span className='font-math clr-text-default md:pr-1 pl-1 md:pl-0'>P</span>}
          value={stats.count_predicate}
          title='Предикат-функции'
        />
        <ValueStats
          id='count_theorem'
          icon={<span className='font-math clr-text-default md:pr-1 pl-1 md:pl-0'>T</span>}
          value={stats.count_theorem}
          title='Теоремы'
        />

        <ValueStats
          id='count_text_term'
          icon={<IconTerminology size='1.25rem' className='clr-text-primary' />}
          value={stats.count_text_term}
          title='Термины'
        />
        <ValueStats
          id='count_definition'
          icon={<IconDefinition size='1.25rem' className='clr-text-primary' />}
          value={stats.count_definition}
          title='Определения'
        />
        <ValueStats
          id='count_convention'
          icon={<IconConvention size='1.25rem' className='clr-text-primary' />}
          value={stats.count_convention}
          title='Конвенции'
        />
      </div>
    </div>
  );
}

export default RSFormStats;
