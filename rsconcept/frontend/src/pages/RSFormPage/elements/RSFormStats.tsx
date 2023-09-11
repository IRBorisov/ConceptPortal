import Divider from '../../../components/Common/Divider';
import LabeledText from '../../../components/Common/LabeledText';
import { type IRSFormStats } from '../../../models/rsform';

interface RSFormStatsProps {
  stats: IRSFormStats
}

function RSFormStats({ stats }: RSFormStatsProps) {
  return (
    <div className='flex flex-col gap-1 px-4 py-2 border min-w-[16rem]'>
      <LabeledText id='count_all'
        label='Всего конституент '
        text={stats.count_all}
      />
      <LabeledText id='count_errors'
        label='Ошибок '
        text={stats.count_errors}
      />
      { stats.count_property > 0 &&
      <LabeledText id='count_property'
        label='Только свойство '
        text={stats.count_property}
      />}
      { stats.count_incalc > 0 &&
      <LabeledText id='count_incalc'
        label='Невычислимы '
        text={stats.count_incalc}
      />}
      <Divider margins='my-2' />
      <LabeledText id='count_termin'
        label='Термины '
        text={stats.count_termin}
      />
      <LabeledText id='count_definition'
        label='Определения '
        text={stats.count_definition}
      />
      <LabeledText id='count_convention'
        label='Конвенции '
        text={stats.count_convention}
      />
      <Divider margins='my-2' />
      { stats.count_base > 0 &&
      <LabeledText id='count_base'
        label='Базисные множества '
        text={stats.count_base}
      />}
      { stats.count_constant > 0 &&
      <LabeledText id='count_constant'
        label='Константные множества '
        text={stats.count_constant}
      />}
      { stats.count_structured > 0 &&
      <LabeledText id='count_structured'
        label='Родовые структуры '
        text={stats.count_structured}
      />}
      { stats.count_axiom > 0 &&
      <LabeledText id='count_axiom'
        label='Аксиомы '
        text={stats.count_axiom}
      />}
      { stats.count_term > 0 &&
      <LabeledText id='count_term'
        label='Термы '
        text={stats.count_term}
      />}
      { stats.count_function > 0 &&
      <LabeledText id='count_function'
        label='Терм-функции '
        text={stats.count_function}
      />}
      { stats.count_predicate > 0 &&
      <LabeledText id='count_predicate'
        label='Предикат-функции '
        text={stats.count_predicate}
      />}
      { stats.count_theorem > 0 &&
      <LabeledText id='count_theorem'
        label='Теормы '
        text={stats.count_theorem}
      />}
    </div>
  );
}

export default RSFormStats;
