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
import { labelCstTypification } from '@/utils/labels';

import EditorRSExpression from '../EditorRSExpression';
import ControlsOverlay from './ControlsOverlay';

/**
 * Characters limit to start increasing number of rows.
 */
export const ROW_SIZE_IN_CHARACTERS = 70;

interface FormConstituentaProps {
  isMutable: boolean;
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
  isMutable,
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
    <div>
      <ControlsOverlay
        isMutable={isMutable}
        isModified={isModified}
        processing={processing}
        constituenta={constituenta}
        onEditTerm={onEditTerm}
        onRename={onRename}
      />
      <form
        id={id}
        className={clsx('cc-column', 'mt-1 w-full md:w-[47.8rem] shrink-0', 'px-4 py-1')}
        onSubmit={handleSubmit}
      >
        <RefsInput
          id='cst_term'
          label='Термин'
          placeholder='Обозначение, используемое в текстовых определениях'
          items={schema?.items}
          value={term}
          initialValue={constituenta?.term_raw ?? ''}
          resolved={constituenta?.term_resolved ?? ''}
          disabled={!isMutable}
          onChange={newValue => setTerm(newValue)}
        />
        <TextArea
          id='cst_typification'
          dense
          noBorder
          disabled
          label='Типизация'
          rows={typification.length > ROW_SIZE_IN_CHARACTERS ? 2 : 1}
          value={typification}
          colors='clr-app'
          style={{
            resize: 'none'
          }}
        />
        <EditorRSExpression
          id='cst_expression'
          label='Формальное определение'
          placeholder='Родоструктурное выражение'
          value={expression}
          activeCst={constituenta}
          showList={showList}
          disabled={!isMutable}
          toggleReset={toggleReset}
          onToggleList={onToggleList}
          onChange={newValue => setExpression(newValue)}
          setTypification={setTypification}
        />
        <RefsInput
          id='cst_definition'
          label='Текстовое определение'
          placeholder='Текстовая интерпретация формального выражения'
          height='3.8rem'
          items={schema?.items}
          value={textDefinition}
          initialValue={constituenta?.definition_raw ?? ''}
          resolved={constituenta?.definition_resolved ?? ''}
          disabled={!isMutable}
          onChange={newValue => setTextDefinition(newValue)}
        />
        <TextArea
          id='cst_convention'
          spellCheck
          label='Конвенция / Комментарий'
          placeholder='Договоренность об интерпретации или пояснение'
          value={convention}
          disabled={!isMutable}
          rows={convention.length > 2 * ROW_SIZE_IN_CHARACTERS ? 3 : 2}
          onChange={event => setConvention(event.target.value)}
        />
        {isMutable || processing ? (
          <SubmitButton
            text='Сохранить изменения'
            className='self-center'
            disabled={!isModified || !isMutable}
            icon={<FiSave size='1.25rem' />}
          />
        ) : null}
      </form>
    </div>
  );
}

export default FormConstituenta;
