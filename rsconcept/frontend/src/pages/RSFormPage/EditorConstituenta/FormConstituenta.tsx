'use client';

import clsx from 'clsx';
import { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { LiaEdit } from 'react-icons/lia';
import { toast } from 'react-toastify';

import MiniButton from '@/components/Common/MiniButton';
import Overlay from '@/components/Common/Overlay';
import SubmitButton from '@/components/Common/SubmitButton';
import TextArea from '@/components/Common/TextArea';
import RefsInput from '@/components/RefsInput';
import { useRSForm } from '@/context/RSFormContext';
import { IConstituenta, ICstRenameData, ICstUpdateData } from '@/models/rsform';
import { classnames } from '@/utils/constants';
import { labelCstTypification } from '@/utils/labels';

import EditorRSExpression from '../EditorRSExpression';

interface FormConstituentaProps {
  disabled?: boolean;
  showList: boolean;

  id?: string;
  constituenta?: IConstituenta;

  isModified: boolean;
  toggleReset: boolean;
  setIsModified: Dispatch<SetStateAction<boolean>>;

  onToggleList: () => void;
  onRenameCst: (initial: ICstRenameData) => void;
  onEditTerm: () => void;
}

function FormConstituenta({
  disabled,
  showList,
  id,
  isModified,
  setIsModified,
  constituenta,
  toggleReset,
  onRenameCst,
  onEditTerm,
  onToggleList
}: FormConstituentaProps) {
  const { schema, cstUpdate, processing } = useRSForm();

  const [alias, setAlias] = useState('');
  const [term, setTerm] = useState('');
  const [textDefinition, setTextDefinition] = useState('');
  const [expression, setExpression] = useState('');
  const [convention, setConvention] = useState('');
  const [typification, setTypification] = useState('N/A');

  useEffect(() => {
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
  }, [
    constituenta,
    constituenta?.term_raw,
    constituenta?.definition_formal,
    constituenta?.definition_raw,
    constituenta?.convention,
    term,
    textDefinition,
    expression,
    convention,
    setIsModified
  ]);

  useLayoutEffect(() => {
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

  return (
    <>
      <Overlay position='top-1 left-[4.1rem]' className='flex select-none'>
        <MiniButton
          title={`Редактировать словоформы термина: ${constituenta?.term_forms.length ?? 0}`}
          disabled={disabled}
          noHover
          onClick={onEditTerm}
          icon={<LiaEdit size='1rem' className={!disabled ? 'clr-text-primary' : ''} />}
        />
        <div className='pt-1 pl-[1.375rem] text-sm font-medium whitespace-nowrap'>
          <span>Имя </span>
          <span className='ml-1'>{constituenta?.alias ?? ''}</span>
        </div>
        <MiniButton
          noHover
          title='Переименовать конституенту'
          disabled={disabled}
          onClick={handleRename}
          icon={<LiaEdit size='1rem' className={!disabled ? 'clr-text-primary' : ''} />}
        />
      </Overlay>
      <form
        id={id}
        className={clsx('mt-1 w-[47.8rem] shrink-0', 'px-4 py-1', classnames.flex_col)}
        onSubmit={handleSubmit}
      >
        <RefsInput
          label='Термин'
          placeholder='Обозначение, используемое в текстовых определениях данной схемы'
          items={schema?.items}
          value={term}
          initialValue={constituenta?.term_raw ?? ''}
          resolved={constituenta?.term_resolved ?? ''}
          disabled={disabled}
          onChange={newValue => setTerm(newValue)}
        />
        <TextArea
          dense
          noBorder
          disabled
          label='Типизация'
          rows={typification.length > 70 ? 2 : 1}
          value={typification}
          colors='clr-app'
          style={{
            resize: 'none'
          }}
        />
        <EditorRSExpression
          label='Формальное определение'
          placeholder='Родоструктурное выражение, задающее формальное определение'
          value={expression}
          activeCst={constituenta}
          showList={showList}
          disabled={disabled}
          toggleReset={toggleReset}
          onToggleList={onToggleList}
          onChange={newValue => setExpression(newValue)}
          setTypification={setTypification}
        />
        <RefsInput
          label='Текстовое определение'
          placeholder='Лингвистическая интерпретация формального выражения'
          height='3.8rem'
          items={schema?.items}
          value={textDefinition}
          initialValue={constituenta?.definition_raw ?? ''}
          resolved={constituenta?.definition_resolved ?? ''}
          disabled={disabled}
          onChange={newValue => setTextDefinition(newValue)}
        />
        <TextArea
          spellCheck
          label='Конвенция / Комментарий'
          placeholder='Договоренность об интерпретации или пояснение'
          value={convention}
          disabled={disabled}
          onChange={event => setConvention(event.target.value)}
        />
        <SubmitButton
          text='Сохранить изменения'
          className='self-center'
          disabled={!isModified || disabled}
          icon={<FiSave size='1.25rem' />}
        />
      </form>
    </>
  );
}

export default FormConstituenta;
