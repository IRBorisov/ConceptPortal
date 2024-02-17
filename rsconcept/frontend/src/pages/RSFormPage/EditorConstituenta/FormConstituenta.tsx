'use client';

import clsx from 'clsx';
import { useEffect, useLayoutEffect, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';

import RefsInput from '@/components/RefsInput';
import SubmitButton from '@/components/ui/SubmitButton';
import TextArea from '@/components/ui/TextArea';
import { useRSForm } from '@/context/RSFormContext';
import { IConstituenta, ICstUpdateData } from '@/models/rsform';
import { classnames } from '@/utils/constants';
import { labelCstTypification } from '@/utils/labels';

import EditorRSExpression from '../EditorRSExpression';
import ControlsOverlay from './ControlsOverlay';

interface FormConstituentaProps {
  disabled?: boolean;
  showList: boolean;

  id?: string;
  constituenta?: IConstituenta;

  isModified: boolean;
  toggleReset: boolean;
  setIsModified: React.Dispatch<React.SetStateAction<boolean>>;

  onToggleList: () => void;
  onRename: () => void;
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
  onRename,
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

  return (
    <>
      <ControlsOverlay disabled={disabled} constituenta={constituenta} onEditTerm={onEditTerm} onRename={onRename} />
      <form
        id={id}
        className={clsx('mt-1 w-full md:w-[47.8rem] shrink-0', 'px-4 py-1', classnames.flex_col)}
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
          placeholder='Родоструктурное выражение'
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
          placeholder='Текстовый вариант формального определения'
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
