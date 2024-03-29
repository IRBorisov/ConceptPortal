'use client';

import clsx from 'clsx';
import { useEffect, useLayoutEffect, useState } from 'react';

import RSInput from '@/components/RSInput';
import Modal, { ModalProps } from '@/components/ui/Modal';
import SelectSingle from '@/components/ui/SelectSingle';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import usePartialUpdate from '@/hooks/usePartialUpdate';
import { CstType, ICstCreateData, IRSForm } from '@/models/rsform';
import { generateAlias, validateNewAlias } from '@/models/rsformAPI';
import { labelCstType } from '@/utils/labels';
import { SelectorCstType } from '@/utils/selectors';

interface DlgCreateCstProps extends Pick<ModalProps, 'hideWindow'> {
  initial?: ICstCreateData;
  schema: IRSForm;
  onCreate: (data: ICstCreateData) => void;
}

function DlgCreateCst({ hideWindow, initial, schema, onCreate }: DlgCreateCstProps) {
  const [validated, setValidated] = useState(false);
  const [cstData, updateCstData] = usePartialUpdate(
    initial || {
      cst_type: CstType.BASE,
      insert_after: null,
      alias: '',
      convention: '',
      definition_formal: '',
      definition_raw: '',
      term_raw: '',
      term_forms: []
    }
  );

  const handleSubmit = () => onCreate(cstData);

  useLayoutEffect(() => {
    updateCstData({ alias: generateAlias(cstData.cst_type, schema) });
  }, [cstData.cst_type, updateCstData, schema]);

  useEffect(() => {
    setValidated(validateNewAlias(cstData.alias, cstData.cst_type, schema));
  }, [cstData.alias, cstData.cst_type, schema]);

  return (
    <Modal
      header='Создание конституенты'
      hideWindow={hideWindow}
      canSubmit={validated}
      onSubmit={handleSubmit}
      submitText='Создать'
      className={clsx('cc-column', 'w-[35rem]', 'py-2 px-6')}
    >
      <div className='flex self-center gap-6'>
        <SelectSingle
          id='dlg_cst_type'
          placeholder='Выберите тип'
          className='min-w-[15rem]'
          options={SelectorCstType}
          value={{ value: cstData.cst_type, label: labelCstType(cstData.cst_type) }}
          onChange={data => updateCstData({ cst_type: data?.value ?? CstType.BASE })}
        />
        <TextInput
          id='dlg_cst_alias'
          dense
          label='Имя'
          className='w-[7rem]'
          value={cstData.alias}
          onChange={event => updateCstData({ alias: event.target.value })}
        />
      </div>
      <TextArea
        id='dlg_cst_term'
        spellCheck
        label='Термин'
        placeholder='Обозначение, используемое в текстовых определениях'
        rows={2}
        value={cstData.term_raw}
        onChange={event => updateCstData({ term_raw: event.target.value })}
      />
      <RSInput
        id='dlg_cst_expression'
        label='Формальное определение'
        placeholder='Родоструктурное выражение'
        value={cstData.definition_formal}
        onChange={value => updateCstData({ definition_formal: value })}
      />
      <TextArea
        id='dlg_cst_definition'
        spellCheck
        label='Текстовое определение'
        placeholder='Текстовая интерпретация формального выражения'
        rows={2}
        value={cstData.definition_raw}
        onChange={event => updateCstData({ definition_raw: event.target.value })}
      />
      <TextArea
        id='dlg_cst_convention'
        spellCheck
        label='Конвенция / Комментарий'
        placeholder='Договоренность об интерпретации или пояснение'
        rows={2}
        value={cstData.convention}
        onChange={event => updateCstData({ convention: event.target.value })}
      />
    </Modal>
  );
}

export default DlgCreateCst;
