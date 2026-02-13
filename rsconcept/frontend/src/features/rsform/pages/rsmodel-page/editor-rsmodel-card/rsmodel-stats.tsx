import { type RSModelStats } from '@/features/rsform/models/rsmodel';

import {
  IconAxiomFalse,
  IconChild,
  IconConvention,
  IconCrucial,
  IconCstAxiom,
  IconCstBaseSet,
  IconCstConstSet,
  IconCstFunction,
  IconCstNominal,
  IconCstPredicate,
  IconCstStructured,
  IconCstTerm,
  IconCstTheorem,
  IconDefinition,
  IconEmptyTerm,
  IconMissingBase,
  IconNotCalculated,
  IconPredecessor,
  IconStatusError,
  IconStatusIncalculable,
  IconStatusProperty,
  IconTerminology
} from '@/components/icons';
import { cn } from '@/components/utils';
import { ValueStats } from '@/components/view';

interface CardRSModelStatsProps {
  className?: string;
  stats: RSModelStats;
}

export function CardRSModelStats({ className, stats }: CardRSModelStatsProps) {
  return (
    <div className={cn('h-min', 'grid grid-cols-4 gap-1 justify-items-end select-none', className)}>
      <div id='count_all' className='col-span-2 w-fit flex gap-3 hover:cursor-default'>
        <span>Всего</span>
        <span className='font-math'>{stats.count_all}</span>
      </div>
      <ValueStats
        id='count_owned'
        title='Собственные'
        icon={<IconPredecessor size='1.25rem' />}
        value={stats.count_all - stats.count_inherited}
      />
      <ValueStats
        id='count_inherited'
        icon={<IconChild size='1.25rem' />}
        value={stats.count_inherited}
        titleHtml='Наследованные'
      />

      <ValueStats
        id='count_base'
        title='Базисные множества'
        icon={<IconCstBaseSet size='1.25rem' />}
        value={stats.count_base}
      />
      <ValueStats
        id='count_constant'
        title='Константные множества'
        icon={<IconCstConstSet size='1.25rem' />}
        value={stats.count_constant}
      />
      <ValueStats
        id='count_structured'
        title='Родовые структуры'
        icon={<IconCstStructured size='1.25rem' />}
        value={stats.count_structured}
      />
      <ValueStats id='count_axiom' title='Аксиомы' icon={<IconCstAxiom size='1.25rem' />} value={stats.count_axiom} />

      <ValueStats id='count_term' title='Термы' icon={<IconCstTerm size='1.25rem' />} value={stats.count_term} />
      <ValueStats
        id='count_function'
        title='Терм-функции'
        icon={<IconCstFunction size='1.25rem' />}
        value={stats.count_function}
      />
      <ValueStats
        id='count_predicate'
        title='Предикат-функции'
        icon={<IconCstPredicate size='1.25rem' />}
        value={stats.count_predicate}
      />
      <ValueStats
        id='count_theorem'
        title='Теоремы'
        icon={<IconCstTheorem size='1.25rem' />}
        value={stats.count_theorem}
      />

      <ValueStats
        id='count_property'
        title='Неразмерные'
        icon={<IconStatusProperty size='1.25rem' />}
        value={stats.count_property}
      />
      <ValueStats
        id='count_incalculable'
        title='Невычислимые'
        icon={<IconStatusIncalculable size='1.25rem' />}
        value={stats.count_incalculable}
      />
      <ValueStats
        id='count_errors'
        title='Некорректные'
        icon={<IconStatusError size='1.25rem' className={stats.count_errors > 0 ? 'text-destructive' : undefined} />}
        value={stats.count_errors}
      />
      <ValueStats
        id='count_nominal'
        title='Номиноиды'
        icon={<IconCstNominal size='1.25rem' className={stats.count_nominal > 0 ? 'text-destructive' : undefined} />}
        value={stats.count_nominal}
      />

      <ValueStats
        id='count_crucial'
        title='Ключевые'
        icon={<IconCrucial size='1.25rem' />}
        value={stats.count_crucial}
      />
      <ValueStats
        id='count_text_term'
        title='Термины'
        icon={<IconTerminology size='1.25rem' />}
        value={stats.count_text_term}
      />
      <ValueStats
        id='count_definition'
        title='Определения'
        icon={<IconDefinition size='1.25rem' />}
        value={stats.count_definition}
      />
      <ValueStats
        id='count_convention'
        title='Конвенции'
        icon={
          <IconConvention
            size='1.25rem'
            className={
              stats.count_convention < stats.count_structured + stats.count_base ? 'text-destructive' : undefined
            }
          />
        }
        value={stats.count_convention}
      />
      <ValueStats
        id='count_missing_base'
        title='Отсутствующие базовые интерпретации'
        icon={
          <IconMissingBase
            size='1.25rem'
            className={stats.count_missing_base > 0 ? 'text-destructive' : undefined} />
        }
        value={stats.count_missing_base}
      />
      <ValueStats
        id='count_false_axioms'
        title='Невыполненные аксиомы'
        icon={<IconAxiomFalse size='1.25rem' className={stats.count_false_axioms > 0 ? 'text-destructive' : undefined} />}
        value={stats.count_false_axioms}
      />
      <ValueStats
        id='count_invalid_calculations'
        title='Невычислимые конституенты'
        icon={<IconNotCalculated size='1.25rem' className={stats.count_invalid_calculations > 0 ? 'text-destructive' : undefined} />}
        value={stats.count_invalid_calculations}
      />
      <ValueStats
        id='count_empty_terms'
        title='Пустые термы'
        icon={<IconEmptyTerm size='1.25rem' />}
        value={stats.count_empty_terms}
      />
    </div>
  );
}
