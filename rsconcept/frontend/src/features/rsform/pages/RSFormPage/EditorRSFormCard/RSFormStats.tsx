import clsx from 'clsx';

import {
  IconChild,
  IconConvention,
  IconCstAxiom,
  IconCstBaseSet,
  IconCstConstSet,
  IconCstFunction,
  IconCstPredicate,
  IconCstStructured,
  IconCstTerm,
  IconCstTheorem,
  IconDefinition,
  IconPredecessor,
  IconStatusError,
  IconStatusIncalculable,
  IconStatusOK,
  IconStatusProperty,
  IconTerminology
} from '@/components/Icons';
import { ValueStats } from '@/components/View';

import { IRSFormStats } from '../../../models/rsform';

interface RSFormStatsProps {
  isArchive: boolean;
  stats: IRSFormStats;
}

function RSFormStats({ stats, isArchive }: RSFormStatsProps) {
  return (
    <div
      className={clsx(
        'mt-3 md:ml-5 md:mt-8 md:w-[18rem] w-[25rem] h-min mx-auto', // prettier: split-lines
        'grid grid-cols-4 gap-1 justify-items-end'
      )}
    >
      <div id='count_all' className='col-span-2 w-fit flex gap-3 hover:cursor-default '>
        <span>Всего</span>
        <span>{stats.count_all}</span>
      </div>
      <ValueStats
        id='count_owned'
        icon={<IconPredecessor size='1.25rem' className='text-sec-600' />}
        value={stats.count_all - stats.count_inherited}
        title='Собственные'
      />
      <ValueStats
        id='count_inherited'
        icon={<IconChild size='1.25rem' className='text-sec-600' />}
        value={stats.count_inherited}
        titleHtml={isArchive ? 'Архивные схемы не хранят<br/> информацию о наследовании' : 'Наследованные'}
      />

      <ValueStats
        className='col-start-1'
        id='count_ok'
        icon={<IconStatusOK size='1.25rem' className='text-ok-600' />}
        value={stats.count_all - stats.count_errors - stats.count_property - stats.count_incalculable}
        title='Корректные'
      />
      <ValueStats
        id='count_property'
        icon={<IconStatusProperty size='1.25rem' className='text-sec-600' />}
        value={stats.count_errors}
        title='Неразмерные'
      />
      <ValueStats
        id='count_incalculable'
        icon={<IconStatusIncalculable size='1.25rem' className='text-warn-600' />}
        value={stats.count_incalculable}
        title='Невычислимые'
      />
      <ValueStats
        id='count_errors'
        icon={<IconStatusError size='1.25rem' className='text-warn-600' />}
        value={stats.count_errors}
        title='Некорректные'
      />

      <ValueStats
        id='count_base'
        icon={<IconCstBaseSet size='1.25rem' className='clr-text-controls' />}
        value={stats.count_base}
        title='Базисные множества'
      />
      <ValueStats
        id='count_constant'
        icon={<IconCstConstSet size='1.25rem' className='clr-text-controls' />}
        value={stats.count_constant}
        title='Константные множества'
      />
      <ValueStats
        id='count_structured'
        icon={<IconCstStructured size='1.25rem' className='clr-text-controls' />}
        value={stats.count_structured}
        title='Родовые структуры'
      />
      <ValueStats
        id='count_axiom'
        icon={<IconCstAxiom size='1.25rem' className='clr-text-controls' />}
        value={stats.count_axiom}
        title='Аксиомы'
      />

      <ValueStats
        id='count_term'
        icon={<IconCstTerm size='1.25rem' className='clr-text-controls' />}
        value={stats.count_term}
        title='Термы'
      />
      <ValueStats
        id='count_function'
        icon={<IconCstFunction size='1.25rem' className='clr-text-controls' />}
        value={stats.count_function}
        title='Терм-функции'
      />
      <ValueStats
        id='count_predicate'
        icon={<IconCstPredicate size='1.25rem' className='clr-text-controls' />}
        value={stats.count_predicate}
        title='Предикат-функции'
      />
      <ValueStats
        id='count_theorem'
        icon={<IconCstTheorem size='1.25rem' className='clr-text-controls' />}
        value={stats.count_theorem}
        title='Теоремы'
      />

      <ValueStats
        id='count_text_term'
        icon={<IconTerminology size='1.25rem' className='text-sec-600' />}
        value={stats.count_text_term}
        title='Термины'
      />
      <ValueStats
        id='count_definition'
        icon={<IconDefinition size='1.25rem' className='text-sec-600' />}
        value={stats.count_definition}
        title='Определения'
      />
      <ValueStats
        id='count_convention'
        icon={<IconConvention size='1.25rem' className='text-sec-600' />}
        value={stats.count_convention}
        title='Конвенции'
      />
    </div>
  );
}

export default RSFormStats;
