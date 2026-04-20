import { type RSFormStats } from '@/domain/library';

import { Divider } from '@/components/container';
import { cn } from '@/components/utils';
import { StatsCategory } from '@/components/view/stats-category';

interface ViewSchemaStatsProps {
  className?: string;
  stats: RSFormStats;
}

export function ViewSchemaStats({ className, stats }: ViewSchemaStatsProps) {
  const countOwned = stats.count_all - stats.count_inherited;
  const countBase = stats.count_structured + stats.count_base;
  const countErrors = stats.count_incorrect + stats.count_incalculable;
  const countDerived = stats.count_all - stats.count_base - stats.count_nominal;

  return (
    <div className={cn('h-fit flex flex-col border select-none', className)}>
      <StatsCategory
        id='stats-overview'
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
          { label: 'Определения', value: stats.count_definition },
          { label: 'Конвенции', value: stats.count_convention },
          { label: 'Комментарии', value: stats.count_comment }
        ]}
      />

      <Divider margins='mx-3' />

      <StatsCategory
        id='stats-structures'
        label='Характеристика ядра'
        primaryLabel='Базовые'
        primaryValue={countBase}
        primaryTitle='Количество<br/>неопределяемых понятий'
        secondaryLabel='Сложность'
        secondaryValue={stats.step_complexity}
        secondaryTitle='Количество терминов,<br/>характеризующих базовые понятия'
        details={[
          { label: 'Номиноиды', value: stats.count_nominal },
          { label: 'Базисные множества', value: stats.count_base },
          { label: 'Константные множества', value: stats.count_constant },
          { label: 'Родовые структуры', value: stats.count_structured },
          { label: 'Аксиомы', value: stats.count_axiom }
        ]}
      />

      <Divider margins='mx-3' />

      <StatsCategory
        id='stats-logics'
        label='Характеристика тела'
        primaryLabel='Производные'
        primaryValue={countDerived}
        primaryTitle='Количество выводимых<br/>понятий и утверждений'
        secondaryLabel='Функции'
        secondaryValue={stats.count_function + stats.count_predicate}
        secondaryTitle='Количество терм-функций<br/>и предикат-функций'
        details={[
          { label: 'Термы', value: stats.count_term },
          { label: 'Терм-функции', value: stats.count_function },
          { label: 'Предикат-функции', value: stats.count_predicate },
          { label: 'Теоремы', value: stats.count_theorem }
        ]}
      />

      <Divider margins='mx-3' />

      <StatsCategory
        id='stats-quality'
        className='rounded-b-md'
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
    </div>
  );
}
