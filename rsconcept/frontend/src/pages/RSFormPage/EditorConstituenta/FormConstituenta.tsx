'use client';

import { Dispatch, SetStateAction, useLayoutEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import MiniButton from '@/components/Common/MiniButton';
import Overlay from '@/components/Common/Overlay';
import SubmitButton from '@/components/Common/SubmitButton';
import TextArea from '@/components/Common/TextArea';
import { EditIcon, SaveIcon } from '@/components/Icons';
import RefsInput from '@/components/RefsInput';
import { useRSForm } from '@/context/RSFormContext';
import { IConstituenta, ICstRenameData, ICstUpdateData } from '@/models/rsform';
import { labelCstTypification } from '@/utils/labels';

import EditorRSExpression from '../EditorRSExpression';

interface FormConstituentaProps {
  id?: string
  constituenta?: IConstituenta
  
  isModified: boolean
  toggleReset: boolean
  setIsModified: Dispatch<SetStateAction<boolean>>

  onRenameCst: (initial: ICstRenameData) => void
  onEditTerm: () => void
}

function FormConstituenta({
  id, isModified, setIsModified,
  constituenta, toggleReset,
  onRenameCst, onEditTerm
}: FormConstituentaProps) {
  const { schema, cstUpdate, isMutable, processing } = useRSForm();

  const readyForEdit = useMemo(() => (!!constituenta && isMutable), [constituenta, isMutable]);
  
  const [alias, setAlias] = useState('');
  const [term, setTerm] = useState('');
  const [textDefinition, setTextDefinition] = useState('');
  const [expression, setExpression] = useState('');
  const [convention, setConvention] = useState('');
  const [typification, setTypification] = useState('N/A');
  
  useLayoutEffect(
  () => {
    if (!constituenta) {
      setIsModified(false);
      return;
    }
    setIsModified(
      constituenta.term_raw !== term ||
      constituenta.definition_raw !== textDefinition ||
      constituenta.convention !== convention ||
      constituenta.definition_formal !== expression
    );
    return () => setIsModified(false);
  }, [constituenta, constituenta?.term_raw, constituenta?.definition_formal,
    constituenta?.definition_raw, constituenta?.convention,
    term, textDefinition, expression, convention, setIsModified]);

  useLayoutEffect(
  () => {
    if (constituenta) {
      setAlias(constituenta.alias);
      setConvention(constituenta.convention || '');
      setTerm(constituenta.term_raw || '');
      setTextDefinition(constituenta.definition_raw || '');
      setExpression(constituenta.definition_formal || '');
      setTypification(constituenta ? labelCstTypification(constituenta) : 'N/A');
    }
  }, [constituenta, schema, toggleReset]);

  function handleSubmit(event?: React.FormEvent<HTMLFormElement>) {
    if (event) {
      event.preventDefault();
    }
    if (!constituenta || processing) {
      return;
    }
    const data: ICstUpdateData = {
      id: constituenta.id,
      alias: alias,
      convention: convention,
      definition_formal: expression,
      definition_raw: textDefinition,
      term_raw: term
    };
    cstUpdate(data, () => toast.success('Изменения сохранены'));
  }

  function handleRename() {
    if (!constituenta) {
      return;
    }
    const data: ICstRenameData = {
      id: constituenta.id,
      alias: constituenta.alias,
      cst_type: constituenta.cst_type
    };
    onRenameCst(data);
  }

  return (<>
  <Overlay position='top-0 left-[3rem]' className='flex justify-start select-none' >
    <MiniButton
      tooltip={`Редактировать словоформы термина: ${constituenta?.term_forms.length ?? 0}`}
      disabled={!readyForEdit}
      noHover
      onClick={onEditTerm}
      icon={<EditIcon size={4} color={readyForEdit ? 'clr-text-primary' : ''} />}
    />
    <div className='pt-1 pl-[1.375rem] text-sm font-semibold w-fit'>
      <span>Имя </span>
      <span className='ml-1'>{constituenta?.alias ?? ''}</span>
    </div>
    <MiniButton noHover
      tooltip='Переименовать конституенту'
      disabled={!readyForEdit}
      onClick={handleRename}
      icon={<EditIcon size={4} color={readyForEdit ? 'clr-text-primary' : ''} />}
    />
  </Overlay>
  <form id={id}
    className='flex flex-col gap-3 mt-1'
    onSubmit={handleSubmit}
  >
    <RefsInput
      label='Термин'
      placeholder='Обозначение, используемое в текстовых определениях данной схемы'
      items={schema?.items}
      value={term}
      initialValue={constituenta?.term_raw ?? ''}
      resolved={constituenta?.term_resolved ?? ''}
      disabled={!readyForEdit}
      onChange={newValue => setTerm(newValue)}
    />
    <TextArea dense noBorder
      label='Типизация'
      rows={typification.length > 70 ? 2 : 1}
      value={typification}
      colors='clr-app'
      dimensions='w-full'
      style={{
        resize: 'none'
      }}
      disabled
    />
    <EditorRSExpression
      label='Формальное определение'
      activeCst={constituenta}
      placeholder='Родоструктурное выражение, задающее формальное определение'
      value={expression}
      disabled={!readyForEdit}
      toggleReset={toggleReset}
      onChange={newValue => setExpression(newValue)}
      setTypification={setTypification}
    />
    <RefsInput 
      label='Текстовое определение'
      placeholder='Лингвистическая интерпретация формального выражения'
      items={schema?.items}
      value={textDefinition}
      initialValue={constituenta?.definition_raw ?? ''}
      resolved={constituenta?.definition_resolved ?? ''}
      disabled={!readyForEdit}
      onChange={newValue => setTextDefinition(newValue)}
    />
    <TextArea spellCheck
      label='Конвенция / Комментарий'
      placeholder='Договоренность об интерпретации или пояснение'
      value={convention}
      disabled={!readyForEdit}
      onChange={event => setConvention(event.target.value)}
    />
    <div className='flex justify-center w-full'>
      <SubmitButton
        text='Сохранить изменения'
        disabled={!isModified || !readyForEdit}
        icon={<SaveIcon size={6} />}
      />
    </div>
  </form>
  </>);
}

export default FormConstituenta;