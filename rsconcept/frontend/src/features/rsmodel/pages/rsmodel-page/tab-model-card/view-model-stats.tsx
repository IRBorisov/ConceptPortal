import { type RSModelStats } from '@/domain/library';

import { Divider } from '@/components/container';
import { cn } from '@/components/utils';
import { StatsCategory } from '@/components/view/stats-category';

interface ViewModelStatsProps {
  className?: string;
  stats: RSModelStats;
}

export function ViewModelStats({ className, stats }: ViewModelStatsProps) {
  const countOwned = stats.count_all - stats.count_inherited;
  const countBase = stats.count_structured + stats.count_base;
  const countErrors = stats.count_incorrect + stats.count_incalculable;
  const countDerived = stats.count_all - stats.count_base - stats.count_nominal;
  const countModelNotes =
    stats.count_missing_base + stats.count_false_axioms + stats.count_invalid_calculations + stats.count_empty_terms;

  return (
    <div className={cn('h-fit flex flex-col border select-none', className)}>
      <StatsCategory
        id='rsmodel-stats-overview'
        className='rounded-t-md'
        label='Общий состав'
        primaryLabel='Конституенты'
        primaryValue={stats.count_all}
        primaryTitle='Общее количество конституент'
        secondaryLabel={stats.count_inherited > 0 ? 'Собственные' : undefined}
        secondaryValue={stats.count_inherited > 0 ? countOwned : undefined}
        secondaryTitle='Количество собственных конституент'
        details={[
          { label: 'Всего конституент', value: stats.count_all },
          { label: 'Наследованные', value: stats.count_inherited },
          { label: 'Собственные', value: countOwned },
          { label: 'Ключевые', value: stats.count_crucial },
          { label: 'Термины', value: stats.count_term },
          { label: 'Текстовые термины', value: stats.count_text_term },
          { label: 'Определения', value: stats.count_definition },
          { label: 'Конвенции', value: stats.count_convention },
          { label: 'Комментарии', value: stats.count_comment }
        ]}
      />

      <Divider margins='mx-3' />

      <StatsCategory
        id='rsmodel-stats-structures'
        label='Характеристика схемы'
        primaryLabel='Базовые'
        primaryValue={countBase}
        primaryTitle='Количество<br/>неопределяемых понятий'
        secondaryLabel='Сложность'
        secondaryValue={stats.step_complexity}
        secondaryTitle='Количество терминов,<br/>характеризующих базовые понятия'
        details={[
          { label: 'Базовые', value: countBase },
          { label: 'Выводимые', value: countDerived },
          { label: 'Номиноиды', value: stats.count_nominal },
          { label: 'Базисные множества', value: stats.count_base },
          { label: 'Константные множества', value: stats.count_constant },
          { label: 'Родовые структуры', value: stats.count_structured },
          { label: 'Аксиомы', value: stats.count_axiom },
          { label: 'Термы', value: stats.count_term },
          { label: 'Терм-функции', value: stats.count_function },
          { label: 'Предикат-функции', value: stats.count_predicate },
          { label: 'Теоремы', value: stats.count_theorem }
        ]}
      />

      <Divider margins='mx-3' />

      <StatsCategory
        id='rsmodel-stats-quality'
        label='Корректность'
        primaryLabel='Проблемы'
        primaryValue={stats.count_problematic}
        primaryTitle='Количество проблем, включая ошибки, омонимы и дубликаты'
        secondaryLabel='Ошибки'
        secondaryValue={countErrors}
        secondaryTitle='Ошибочные определения, включая синтаксические, семантические и интерпретационные ошибки'
        details={[
          { label: 'Омонимы', value: stats.count_homonyms },
          { label: 'Дубликаты', value: stats.count_formal_duplicates },
          { label: 'Без конвенции или термина', value: stats.count_missing_convention },
          { label: 'Синтаксические ошибки', value: stats.count_failed_parse },
          { label: 'Семантические ошибки', value: stats.count_incorrect },
          { label: 'Неразмерные', value: stats.count_property },
          { label: 'Невычислимые', value: stats.count_incalculable }
        ]}
      />

      <Divider margins='mx-3' />

      <StatsCategory
        id='rsmodel-stats-model'
        className='rounded-b-md'
        label='Характеристика модели'
        primaryLabel='Замечания'
        primaryValue={countModelNotes}
        primaryTitle='Сумма замечаний по текущим данным модели:<br/>отсутствующие базовые интерпретации, невыполненные аксиомы, ошибки вычисления и пустые термы'
        secondaryLabel='База'
        secondaryValue={stats.base_elements}
        secondaryTitle='Суммарная мощность интерпретаций базовых понятий'
        details={[
          { label: 'Мощность базы', value: stats.base_elements },
          { label: 'Базовые без интерпретации', value: stats.count_missing_base },
          { label: 'Нарушенные аксиомы', value: stats.count_false_axioms },
          { label: 'Невычислимые выражения', value: stats.count_invalid_calculations },
          { label: 'Пустые термы', value: stats.count_empty_terms }
        ]}
      />
    </div>
  );
}
