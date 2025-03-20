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
} from '@/components/icons';
import { ValueStats } from '@/components/view';

import { type IRSFormStats } from '../../../models/rsform';

interface RSFormStatsProps {
  className?: string;
  isArchive: boolean;
  stats: IRSFormStats;
}

export function RSFormStats({ className, stats, isArchive }: RSFormStatsProps) {
  return (
    <div className={clsx('grid grid-cols-4 gap-1 justify-items-end', className)}>
      <div id='count_all' className='col-span-2 w-fit flex gap-3 hover:cursor-default '>
        <span>Всего</span>
        <span>{stats.count_all}</span>
      </div>
      <ValueStats
        id='count_owned'
        title='Собственные'
        icon={<IconPredecessor size='1.25rem' className='text-sec-600' />}
        value={stats.count_all - stats.count_inherited}
      />
      <ValueStats
        id='count_inherited'
        icon={<IconChild size='1.25rem' className='text-sec-600' />}
        value={stats.count_inherited}
        titleHtml={isArchive ? 'Архивные схемы не хранят<br/> информацию о наследовании' : 'Наследованные'}
      />

      <ValueStats
        id='count_ok'
        title='Корректные'
        className='col-start-1'
        icon={<IconStatusOK size='1.25rem' className='text-ok-600' />}
        value={stats.count_all - stats.count_errors - stats.count_property - stats.count_incalculable}
      />
      <ValueStats
        id='count_property'
        title='Неразмерные'
        icon={<IconStatusProperty size='1.25rem' className='text-sec-600' />}
        value={stats.count_errors}
      />
      <ValueStats
        id='count_incalculable'
        title='Невычислимые'
        icon={<IconStatusIncalculable size='1.25rem' className='text-warn-600' />}
        value={stats.count_incalculable}
      />
      <ValueStats
        id='count_errors'
        title='Некорректные'
        icon={<IconStatusError size='1.25rem' className='text-warn-600' />}
        value={stats.count_errors}
      />

      <ValueStats
        id='count_base'
        title='Базисные множества'
        icon={<IconCstBaseSet size='1.25rem' className='clr-text-controls' />}
        value={stats.count_base}
      />
      <ValueStats
        id='count_constant'
        title='Константные множества'
        icon={<IconCstConstSet size='1.25rem' className='clr-text-controls' />}
        value={stats.count_constant}
      />
      <ValueStats
        id='count_structured'
        title='Родовые структуры'
        icon={<IconCstStructured size='1.25rem' className='clr-text-controls' />}
        value={stats.count_structured}
      />
      <ValueStats
        id='count_axiom'
        title='Аксиомы'
        icon={<IconCstAxiom size='1.25rem' className='clr-text-controls' />}
        value={stats.count_axiom}
      />

      <ValueStats
        id='count_term'
        title='Термы'
        icon={<IconCstTerm size='1.25rem' className='clr-text-controls' />}
        value={stats.count_term}
      />
      <ValueStats
        id='count_function'
        title='Терм-функции'
        icon={<IconCstFunction size='1.25rem' className='clr-text-controls' />}
        value={stats.count_function}
      />
      <ValueStats
        id='count_predicate'
        title='Предикат-функции'
        icon={<IconCstPredicate size='1.25rem' className='clr-text-controls' />}
        value={stats.count_predicate}
      />
      <ValueStats
        id='count_theorem'
        title='Теоремы'
        icon={<IconCstTheorem size='1.25rem' className='clr-text-controls' />}
        value={stats.count_theorem}
      />

      <ValueStats
        id='count_text_term'
        title='Термины'
        icon={<IconTerminology size='1.25rem' className='text-sec-600' />}
        value={stats.count_text_term}
      />
      <ValueStats
        id='count_definition'
        title='Определения'
        icon={<IconDefinition size='1.25rem' className='text-sec-600' />}
        value={stats.count_definition}
      />
      <ValueStats
        id='count_convention'
        title='Конвенции'
        icon={<IconConvention size='1.25rem' className='text-sec-600' />}
        value={stats.count_convention}
      />
    </div>
  );
}
