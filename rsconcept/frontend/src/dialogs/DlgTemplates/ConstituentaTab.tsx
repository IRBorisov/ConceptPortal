import { Dispatch } from 'react';

import SelectSingle from '../../components/Common/SelectSingle';
import TextArea from '../../components/Common/TextArea';
import TextInput from '../../components/Common/TextInput';
import RSInput from '../../components/RSInput';
import { CstType, ICstCreateData } from '../../models/rsform';
import { labelCstType } from '../../utils/labels';
import { SelectorCstType } from '../../utils/selectors';

interface ConstituentaTabProps {
  state: ICstCreateData
  partialUpdate: Dispatch<Partial<ICstCreateData>>
}

function ConstituentaTab({state, partialUpdate}: ConstituentaTabProps) {
  return (
  <div className='flex flex-col gap-2'>
    <div className='flex justify-center w-full gap-6'>
      <SelectSingle
        className='my-2 min-w-[15rem] self-center'
        options={SelectorCstType}
        placeholder='Выберите тип'
        value={{ value: state.cst_type, label: labelCstType(state.cst_type) }}
        onChange={data => partialUpdate({ cst_type: data?.value ?? CstType.TERM})}
      />
      <TextInput id='alias' label='Имя'
        dense
        dimensions='w-[7rem]'
        value={state.alias}
        onChange={event => partialUpdate({ alias: event.target.value})}
      />
    </div>
    <TextArea id='term' label='Термин'
      placeholder='Схемный или предметный термин, обозначающий данное понятие или утверждение'
      rows={2}
      value={state.term_raw}
      spellCheck
      onChange={event => partialUpdate({ term_raw: event.target.value })}
    />
    <RSInput id='expression' label='Формальное определение'
      placeholder='Родоструктурное выражение, задающее формальное определение'
      editable
      height='4.8rem'
      value={state.definition_formal}
      onChange={value => partialUpdate({definition_formal: value})}
    />
    <TextArea id='definition' label='Текстовое определение'
      placeholder='Лингвистическая интерпретация формального выражения'
      rows={2}
      value={state.definition_raw}
      spellCheck
      onChange={event => partialUpdate({ definition_raw: event.target.value })}
    />
    <TextArea id='convention' label='Конвенция / Комментарий'
      placeholder='Договоренность об интерпретации неопределяемого понятия&#x000D;&#x000A;Комментарий к производному понятию'
      rows={2}
      value={state.convention}
      spellCheck
      onChange={event => partialUpdate({ convention: event.target.value })}
    />
  </div>);
}

export default ConstituentaTab;
