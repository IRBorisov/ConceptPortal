import { useEffect, useLayoutEffect, useState } from 'react';

import ConceptTooltip from '../../components/Common/ConceptTooltip';
import Modal, { ModalProps } from '../../components/Common/Modal';
import SelectSingle from '../../components/Common/SelectSingle';
import SwitchButton from '../../components/Common/SwitchButton';
import TextArea from '../../components/Common/TextArea';
import TextInput from '../../components/Common/TextInput';
import HelpRSTemplates from '../../components/Help/HelpRSTemplates';
import { HelpIcon } from '../../components/Icons';
import RSInput from '../../components/RSInput';
import usePartialUpdate from '../../hooks/usePartialUpdate';
import { CstType,ICstCreateData, IRSForm } from '../../models/rsform';
import { labelCstType } from '../../utils/labels';
import { createAliasFor, validateCstAlias } from '../../utils/misc';
import { SelectorCstType } from '../../utils/selectors';

interface DlgTemplatesProps
extends Pick<ModalProps, 'hideWindow'> {
  schema: IRSForm
  onCreate: (data: ICstCreateData) => void
}

function DlgTemplates({ hideWindow, schema, onCreate }: DlgTemplatesProps) {
  const [validated, setValidated] = useState(false);
  const [cstData, updateCstData] = usePartialUpdate({
    cst_type: CstType.TERM,
    insert_after: null,
    alias: '',
    convention: '',
    definition_formal: '',
    definition_raw: '',
    term_raw: '',
    term_forms: []
  });

  const [ showAttributes, setShowAttributes ] = useState(false);

  const handleSubmit = () => onCreate(cstData);
  
  useLayoutEffect(
  () => {
    updateCstData({ alias: createAliasFor(cstData.cst_type, schema) });
  }, [cstData.cst_type, updateCstData, schema]);

  useEffect(
  () => {
    setValidated(validateCstAlias(cstData.alias, cstData.cst_type, schema));
  }, [cstData.alias, cstData.cst_type, schema]);

  return (
  <Modal
    title='Создание конституенты из шаблона'
    hideWindow={hideWindow}
    canSubmit={validated}
    onSubmit={handleSubmit}
    submitText='Создать'
  >
  <div className='h-fit max-w-[40rem] min-w-[40rem] min-h-[35rem] px-2 mb-2 flex flex-col justify-stretch gap-3'>
    <div className='flex items-center self-center flex-start'>
      <SwitchButton 
        label='Шаблон'
        tooltip='Выбор шаблона выражения'
        dimensions='min-w-[10rem] h-fit'
        value={false}
        isSelected={!showAttributes}
        onSelect={(value) => setShowAttributes(value)}
      />
      <SwitchButton 
        label='Конституента'
        tooltip='Редактирование атрибутов конституенты'
        dimensions='min-w-[10rem] h-fit'
        value={true}
        isSelected={showAttributes}
        onSelect={(value) => setShowAttributes(value)}
      />
      <div id='templates-help' className='px-1 py-1'>
        <HelpIcon color='text-primary' size={5} />
      </div>
      <ConceptTooltip
        anchorSelect='#templates-help'
        className='max-w-[30rem] z-modal-tooltip'
        offset={4}
      >
        <HelpRSTemplates />
      </ConceptTooltip>
    </div>

    { !showAttributes && 
    <div>
      Выбор шаблона и параметров
    </div>}
    
    { showAttributes && 
    <div>
      <div className='flex justify-center w-full gap-6'>
        <SelectSingle
          className='my-2 min-w-[15rem] self-center'
          options={SelectorCstType}
          placeholder='Выберите тип'
          value={{ value: cstData.cst_type, label: labelCstType(cstData.cst_type) }}
          onChange={data => updateCstData({ cst_type: data?.value ?? CstType.TERM})}
        />
        <TextInput id='alias' label='Имя'
          dense
          dimensions='w-[7rem]'
          value={cstData.alias}
          onChange={event => updateCstData({ alias: event.target.value})}
        />
      </div>
      <TextArea id='term' label='Термин'
        placeholder='Схемный или предметный термин, обозначающий данное понятие или утверждение'
        rows={2}
        value={cstData.term_raw}
        spellCheck
        onChange={event => updateCstData({ term_raw: event.target.value })}
      />
      <RSInput id='expression' label='Формальное выражение'
        placeholder='Родоструктурное выражение, задающее формальное определение'
        editable
        height='4.8rem'
        value={cstData.definition_formal}
        onChange={value => updateCstData({definition_formal: value})}
      />
      <TextArea id='definition' label='Текстовое определение'
        placeholder='Лингвистическая интерпретация формального выражения'
        rows={2}
        value={cstData.definition_raw}
        spellCheck
        onChange={event => updateCstData({ definition_raw: event.target.value })}
      />
      <TextArea id='convention' label='Конвенция / Комментарий'
        placeholder='Договоренность об интерпретации неопределяемого понятия&#x000D;&#x000A;Комментарий к производному понятию'
        rows={2}
        value={cstData.convention}
        spellCheck
        onChange={event => updateCstData({ convention: event.target.value })}
      />
    </div>}
  </div>
  </Modal>);
}

export default DlgTemplates;
