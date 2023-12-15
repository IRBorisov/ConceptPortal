'use client';

import clsx from 'clsx';
import { useEffect, useLayoutEffect, useState } from 'react';

import Modal, { ModalProps } from '@/components/Common/Modal';
import SelectSingle from '@/components/Common/SelectSingle';
import TextArea from '@/components/Common/TextArea';
import TextInput from '@/components/Common/TextInput';
import RSInput from '@/components/RSInput';
import usePartialUpdate from '@/hooks/usePartialUpdate';
import { CstType,ICstCreateData, IRSForm } from '@/models/rsform';
import { labelCstType } from '@/utils/labels';
import { createAliasFor, validateCstAlias } from '@/utils/misc';
import { SelectorCstType } from '@/utils/selectors';

interface DlgCreateCstProps
extends Pick<ModalProps, 'hideWindow'> {
  initial?: ICstCreateData
  schema: IRSForm
  onCreate: (data: ICstCreateData) => void
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
    title='Создание конституенты'
    hideWindow={hideWindow}
    canSubmit={validated}
    onSubmit={handleSubmit}
    submitText='Создать'
    className={clsx(
      'h-fit min-w-[35rem]',
      'py-2 px-6 flex flex-col gap-3 justify-stretch'
    )}
  >
    <div className='flex justify-center w-full gap-6'>
      <SelectSingle
        placeholder='Выберите тип'
        className='min-w-[15rem] self-center'
        options={SelectorCstType}
        value={{ value: cstData.cst_type, label: labelCstType(cstData.cst_type) }}
        onChange={data => updateCstData({ cst_type: data?.value ?? CstType.BASE})}
      />
      <TextInput dense
        label='Имя'
        dimensions='w-[7rem]'
        value={cstData.alias}
        onChange={event => updateCstData({ alias: event.target.value})}
      />
    </div>
    <TextArea spellCheck
      label='Термин'
      placeholder='Схемный или предметный термин, обозначающий данное понятие или утверждение'
      rows={2}
      value={cstData.term_raw}
      onChange={event => updateCstData({ term_raw: event.target.value })}
    />
    <RSInput
      label='Формальное определение'
      placeholder='Родоструктурное выражение, задающее формальное определение'
      height='5.1rem'
      value={cstData.definition_formal}
      onChange={value => updateCstData({definition_formal: value})}
    />
    <TextArea spellCheck
      label='Текстовое определение'
      placeholder='Лингвистическая интерпретация формального выражения'
      rows={2}
      value={cstData.definition_raw}
      onChange={event => updateCstData({ definition_raw: event.target.value })}
    />
    <TextArea spellCheck
      label='Конвенция / Комментарий'
      placeholder='Договоренность об интерпретации или пояснение'
      rows={2}
      value={cstData.convention}
      onChange={event => updateCstData({ convention: event.target.value })}
    />
  </Modal>);
}

export default DlgCreateCst;