'use client';

import RSInput from '@/components/RSInput';
import SelectSingle from '@/components/ui/SelectSingle';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import { CstType, ICstCreateData } from '@/models/rsform';
import { labelCstType } from '@/utils/labels';
import { SelectorCstType } from '@/utils/selectors';

interface ConstituentaTabProps {
  state: ICstCreateData;
  partialUpdate: React.Dispatch<Partial<ICstCreateData>>;
}

function ConstituentaTab({ state, partialUpdate }: ConstituentaTabProps) {
  return (
    <>
      <div className='flex self-center gap-3 pr-2'>
        <SelectSingle
          className='min-w-[14rem]'
          options={SelectorCstType}
          placeholder='Выберите тип'
          value={{ value: state.cst_type, label: labelCstType(state.cst_type) }}
          onChange={data => partialUpdate({ cst_type: data?.value ?? CstType.TERM })}
        />
        <TextInput
          dense
          label='Имя'
          className='w-[7rem]'
          value={state.alias}
          onChange={event => partialUpdate({ alias: event.target.value })}
        />
      </div>
      <TextArea
        spellCheck
        label='Термин'
        placeholder='Схемный или предметный термин, обозначающий данное понятие или утверждение'
        rows={2}
        value={state.term_raw}
        onChange={event => partialUpdate({ term_raw: event.target.value })}
      />
      <RSInput
        label='Формальное определение'
        placeholder='Родоструктурное выражение, задающее формальное определение'
        height='5.1rem'
        value={state.definition_formal}
        onChange={value => partialUpdate({ definition_formal: value })}
      />
      <TextArea
        label='Текстовое определение'
        placeholder='Лингвистическая интерпретация формального выражения'
        rows={2}
        value={state.definition_raw}
        spellCheck
        onChange={event => partialUpdate({ definition_raw: event.target.value })}
      />
      <TextArea
        spellCheck
        label='Конвенция / Комментарий'
        placeholder='Договоренность об интерпретации или пояснение к схеме'
        rows={2}
        value={state.convention}
        onChange={event => partialUpdate({ convention: event.target.value })}
      />
    </>
  );
}

export default ConstituentaTab;
