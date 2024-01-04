import Divider from '@/components/ui/Divider';
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
    <div className='flex flex-col gap-1 px-4 mt-8 w-[16rem]'>
      <LabeledValue id='count_all' label='Всего конституент ' text={stats.count_all} />
      <LabeledValue id='count_errors' label='Некорректных' text={stats.count_errors} />
      {stats.count_property !== 0 ? (
        <LabeledValue id='count_property' label='Неразмерных' text={stats.count_property} />
      ) : null}
      {stats.count_incalculable !== 0 ? (
        <LabeledValue id='count_incalculable' label='Невычислимых' text={stats.count_incalculable} />
      ) : null}

      <Divider margins='my-2' />

      <LabeledValue id='count_text_term' label='Термины' text={stats.count_text_term} />
      <LabeledValue id='count_definition' label='Определения' text={stats.count_definition} />
      <LabeledValue id='count_convention' label='Конвенции' text={stats.count_convention} />

      <Divider margins='my-2' />

      {stats.count_base !== 0 ? (
        <LabeledValue id='count_base' label='Базисные множества ' text={stats.count_base} />
      ) : null}
      {stats.count_constant !== 0 ? (
        <LabeledValue id='count_constant' label='Константные множества ' text={stats.count_constant} />
      ) : null}
      {stats.count_structured !== 0 ? (
        <LabeledValue id='count_structured' label='Родовые структуры ' text={stats.count_structured} />
      ) : null}
      {stats.count_axiom !== 0 ? <LabeledValue id='count_axiom' label='Аксиомы ' text={stats.count_axiom} /> : null}
      {stats.count_term !== 0 ? <LabeledValue id='count_term' label='Термы ' text={stats.count_term} /> : null}
      {stats.count_function !== 0 ? (
        <LabeledValue id='count_function' label='Терм-функции ' text={stats.count_function} />
      ) : null}
      {stats.count_predicate !== 0 ? (
        <LabeledValue id='count_predicate' label='Предикат-функции ' text={stats.count_predicate} />
      ) : null}
      {stats.count_theorem !== 0 ? (
        <LabeledValue id='count_theorem' label='Теоремы ' text={stats.count_theorem} />
      ) : null}
    </div>
  );
}

export default RSFormStats;
