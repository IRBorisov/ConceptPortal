import Divider from '../../../components/common/Divider';
import LabeledText from '../../../components/common/LabeledText';
import { type IRSFormStats } from '../../../models/rsform';

interface RSFormStatsProps {
  stats?: IRSFormStats
}

function RSFormStats({ stats }: RSFormStatsProps) {
  if (!stats) {
    return null;
  }
  return (
  <div className='flex flex-col gap-1 px-4 py-2 mt-7 min-w-[16rem]'>
    <LabeledText id='count_all'
      label='Всего конституент '
      text={stats.count_all}
    />
    <LabeledText id='count_errors'
      label='Некорректных'
      text={stats.count_errors}
    />
    {stats.count_property !== 0 ?
    <LabeledText id='count_property'
      label='Неразмерных'
      text={stats.count_property}
    /> : null}
    {stats.count_incalc !== 0 ? 
    <LabeledText id='count_incalc'
      label='Невычислимых'
      text={stats.count_incalc}
    /> : null}

    <Divider margins='my-2' />

    <LabeledText id='count_termin'
      label='Термины'
      text={stats.count_termin}
    />
    <LabeledText id='count_definition'
      label='Определения'
      text={stats.count_definition}
    />
    <LabeledText id='count_convention'
      label='Конвенции'
      text={stats.count_convention}
    />

    <Divider margins='my-2' />

    {stats.count_base !== 0 ? 
    <LabeledText id='count_base'
      label='Базисные множества '
      text={stats.count_base}
    /> : null}
    { stats.count_constant !== 0 ? 
    <LabeledText id='count_constant'
      label='Константные множества '
      text={stats.count_constant}
    /> : null}
    {stats.count_structured !== 0 ? 
    <LabeledText id='count_structured'
      label='Родовые структуры '
      text={stats.count_structured}
    /> : null}
    {stats.count_axiom !== 0 ? 
    <LabeledText id='count_axiom'
      label='Аксиомы '
      text={stats.count_axiom}
    /> : null}
    {stats.count_term !== 0 ? 
    <LabeledText id='count_term'
      label='Термы '
      text={stats.count_term}
    /> : null}
    {stats.count_function !== 0 ? 
    <LabeledText id='count_function'
      label='Терм-функции '
      text={stats.count_function}
    /> : null}
    {stats.count_predicate !== 0 ? 
    <LabeledText id='count_predicate'
      label='Предикат-функции '
      text={stats.count_predicate}
    /> : null}
    {stats.count_theorem !== 0 ? 
    <LabeledText id='count_theorem'
      label='Теоремы '
      text={stats.count_theorem}
    /> : null}
  </div>);
}

export default RSFormStats;
