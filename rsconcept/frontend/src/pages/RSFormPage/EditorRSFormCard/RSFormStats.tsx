import {
  IconChild,
  IconPredecessor,
  IconStatusError,
  IconStatusIncalculable,
  IconStatusOK,
  IconStatusProperty
} from '@/components/Icons';
import IconValue from '@/components/ui/IconValue';
import LabeledValue from '@/components/ui/LabeledValue';
import { type IRSFormStats } from '@/models/rsform';

interface RSFormStatsProps {
  stats?: IRSFormStats;
}

function RSFormStats({ stats }: RSFormStatsProps) {
  if (!stats) {
    return null;
  }
  return (
    <div className='flex flex-col mt-3 sm:gap-1 sm:ml-6 sm:mt-8 sm:w-[16rem]'>
      <div className='grid grid-cols-4 gap-1 mb-3 justify-items-start sm:justify-items-end'>
        <div className='col-span-2 text-left w-full flex gap-3 sm:pl-3'>
          <span>Всего</span>
          <span>{stats.count_all}</span>
        </div>
        <IconValue
          id='count_owned'
          dense
          icon={<IconPredecessor size='1.25rem' className='clr-text-primary' />}
          value={stats.count_all - stats.count_inherited}
          title='Собственные'
        />
        <IconValue
          id='count_inherited'
          dense
          icon={<IconChild size='1.25rem' className='clr-text-primary' />}
          value={stats.count_inherited}
          title='Наследованные'
        />

        <IconValue
          className='col-start-1'
          id='count_ok'
          dense
          icon={<IconStatusOK size='1.25rem' className='clr-text-green' />}
          value={stats.count_all - stats.count_errors - stats.count_property - stats.count_incalculable}
          title='Корректные'
        />
        <IconValue
          id='count_property'
          dense
          icon={<IconStatusProperty size='1.25rem' className='clr-text-primary' />}
          value={stats.count_errors}
          title='Неразмерные'
        />
        <IconValue
          id='count_incalculable'
          dense
          icon={<IconStatusIncalculable size='1.25rem' className='clr-text-red' />}
          value={stats.count_incalculable}
          title='Невычислимые'
        />
        <IconValue
          id='count_errors'
          dense
          icon={<IconStatusError size='1.25rem' className='clr-text-red' />}
          value={stats.count_errors}
          title='Некорректные'
        />

        <IconValue
          id='count_base'
          dense
          icon={<span className='font-math clr-text-default'>X#</span>}
          value={stats.count_base}
          title='Базисные множества'
        />
        <IconValue
          id='count_constant'
          dense
          icon={<span className='font-math clr-text-default'>C#</span>}
          value={stats.count_constant}
          title='Константные множества'
        />
        <IconValue
          id='count_structured'
          dense
          icon={<span className='font-math clr-text-default'>S#</span>}
          value={stats.count_structured}
          title='Родовые структуры'
        />
        <IconValue
          id='count_axiom'
          dense
          icon={<span className='font-math clr-text-default'>A#</span>}
          value={stats.count_axiom}
          title='Аксиомы'
        />

        <IconValue
          id='count_term'
          dense
          icon={<span className='font-math clr-text-default'>D#</span>}
          value={stats.count_term}
          title='Термы'
        />
        <IconValue
          id='count_function'
          dense
          icon={<span className='font-math clr-text-default'>F#</span>}
          value={stats.count_function}
          title='Терм-функции'
        />
        <IconValue
          id='count_predicate'
          dense
          icon={<span className='font-math clr-text-default'>P#</span>}
          value={stats.count_predicate}
          title='Предикат-функции'
        />
        <IconValue
          id='count_theorem'
          dense
          icon={<span className='font-math clr-text-default'>T#</span>}
          value={stats.count_theorem}
          title='Теоремы'
        />
      </div>

      <div className='sm:pl-3 max-w-[10rem] sm:max-w-[12rem]'>
        <LabeledValue id='count_text_term' label='Термины' text={stats.count_text_term} />
        <LabeledValue id='count_definition' label='Определения' text={stats.count_definition} />
        <LabeledValue id='count_convention' label='Конвенции' text={stats.count_convention} />
      </div>
    </div>
  );
}

export default RSFormStats;
