'use client';

import clsx from 'clsx';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { IconSave } from '@/components/Icons';
import RefsInput from '@/components/RefsInput';
import SubmitButton from '@/components/ui/SubmitButton';
import TextArea from '@/components/ui/TextArea';
import AnimateFade from '@/components/wrap/AnimateFade';
import { useRSForm } from '@/context/RSFormContext';
import { CstType, IConstituenta, ICstUpdateData } from '@/models/rsform';
import { isBaseSet, isBasicConcept, isFunctional } from '@/models/rsformAPI';
import { information, labelCstTypification } from '@/utils/labels';

import EditorRSExpression from '../EditorRSExpression';
import ControlsOverlay from './ControlsOverlay';

/**
 * Characters limit to start increasing number of rows.
 */
export const ROW_SIZE_IN_CHARACTERS = 70;

interface FormConstituentaProps {
  disabled: boolean;

  id?: string;
  state?: IConstituenta;

  isModified: boolean;
  toggleReset: boolean;
  setIsModified: React.Dispatch<React.SetStateAction<boolean>>;

  onRename: () => void;
  onEditTerm: () => void;
}

function FormConstituenta({
  disabled,
  id,
  state,

  isModified,
  setIsModified,

  toggleReset,
  onRename,
  onEditTerm
}: FormConstituentaProps) {
  const { schema, cstUpdate, processing } = useRSForm();

  const [alias, setAlias] = useState('');
  const [term, setTerm] = useState('');
  const [textDefinition, setTextDefinition] = useState('');
  const [expression, setExpression] = useState('');
  const [convention, setConvention] = useState('');
  const [typification, setTypification] = useState('N/A');

  const [forceComment, setForceComment] = useState(false);

  const isBasic = useMemo(() => !!state && isBasicConcept(state.cst_type), [state]);
  const isElementary = useMemo(() => !!state && isBaseSet(state.cst_type), [state]);
  const showConvention = useMemo(
    () => !state || !!state.convention || forceComment || isBasic,
    [state, forceComment, isBasic]
  );

  useEffect(() => {
    if (!state) {
      setIsModified(false);
      return;
    }
    setIsModified(
      state.term_raw !== term ||
        state.definition_raw !== textDefinition ||
        state.convention !== convention ||
        state.definition_formal !== expression
    );
    return () => setIsModified(false);
  }, [
    state,
    state?.term_raw,
    state?.definition_formal,
    state?.definition_raw,
    state?.convention,
    term,
    textDefinition,
    expression,
    convention,
    setIsModified
  ]);

  useLayoutEffect(() => {
    if (state) {
      setAlias(state.alias);
      setConvention(state.convention || '');
      setTerm(state.term_raw || '');
      setTextDefinition(state.definition_raw || '');
      setExpression(state.definition_formal || '');
      setTypification(state ? labelCstTypification(state) : 'N/A');
      setForceComment(false);
    }
  }, [state, schema, toggleReset]);

  function handleSubmit(event?: React.FormEvent<HTMLFormElement>) {
    if (event) {
      event.preventDefault();
    }
    if (!state || processing) {
      return;
    }
    const data: ICstUpdateData = {
      id: state.id,
      alias: alias,
      term_raw: term,
      definition_formal: expression,
      definition_raw: textDefinition,
      convention: convention
    };
    cstUpdate(data, () => toast.success(information.changesSaved));
  }

  return (
    <AnimateFade>
      <ControlsOverlay
        disabled={disabled}
        modified={isModified}
        processing={processing}
        constituenta={state}
        onEditTerm={onEditTerm}
        onRename={onRename}
      />
      <form
        id={id}
        className={clsx('cc-column', 'mt-1 w-full md:w-[48.8rem] shrink-0', 'px-6 py-1')}
        onSubmit={handleSubmit}
      >
        <RefsInput
          key='cst_term'
          id='cst_term'
          label='Термин'
          maxHeight='8rem'
          placeholder='Обозначение, используемое в текстовых определениях'
          schema={schema}
          value={term}
          initialValue={state?.term_raw ?? ''}
          resolved={state?.term_resolved ?? ''}
          disabled={disabled}
          onChange={newValue => setTerm(newValue)}
        />
        <TextArea
          id='cst_typification'
          rows={typification.length > ROW_SIZE_IN_CHARACTERS ? 2 : 1}
          dense
          noResize
          noBorder
          disabled={true}
          label='Типизация'
          value={typification}
          colors='clr-app'
        />
        <AnimatePresence>
          <AnimateFade key='cst_expression_fade' hideContent={!!state && !state?.definition_formal && isElementary}>
            <EditorRSExpression
              id='cst_expression'
              label={
                state?.cst_type === CstType.STRUCTURED
                  ? 'Область определения'
                  : !!state && isFunctional(state.cst_type)
                  ? 'Определение функции'
                  : 'Формальное определение'
              }
              placeholder={
                state?.cst_type !== CstType.STRUCTURED
                  ? 'Родоструктурное выражение'
                  : 'Определение множества, которому принадлежат элементы родовой структуры'
              }
              value={expression}
              activeCst={state}
              disabled={disabled}
              toggleReset={toggleReset}
              onChange={newValue => setExpression(newValue)}
              setTypification={setTypification}
            />
          </AnimateFade>
          <AnimateFade key='cst_definition_fade' hideContent={!!state && !state?.definition_raw && isElementary}>
            <RefsInput
              id='cst_definition'
              label='Текстовое определение'
              placeholder='Текстовая интерпретация формального выражения'
              minHeight='3.75rem'
              maxHeight='8rem'
              schema={schema}
              value={textDefinition}
              initialValue={state?.definition_raw ?? ''}
              resolved={state?.definition_resolved ?? ''}
              disabled={disabled}
              onChange={newValue => setTextDefinition(newValue)}
            />
          </AnimateFade>
          <AnimateFade key='cst_convention_fade' hideContent={!showConvention}>
            <TextArea
              id='cst_convention'
              spellCheck
              label={isBasic ? 'Конвенция' : 'Комментарий'}
              placeholder={isBasic ? 'Договоренность об интерпретации' : 'Пояснение разработчика'}
              value={convention}
              disabled={disabled}
              rows={convention.length > 2 * ROW_SIZE_IN_CHARACTERS || convention.includes('\n') ? 4 : 2}
              onChange={event => setConvention(event.target.value)}
            />
          </AnimateFade>
          {!showConvention && (!disabled || processing) ? (
            <button
              key='cst_disable_comment'
              id='cst_disable_comment'
              tabIndex={-1}
              type='button'
              className='self-start cc-label clr-text-url hover:underline'
              onClick={() => setForceComment(true)}
            >
              Добавить комментарий
            </button>
          ) : null}
          {!disabled || processing ? (
            <SubmitButton
              key='cst_form_submit'
              id='cst_form_submit'
              text='Сохранить изменения'
              className='self-center'
              disabled={disabled || !isModified}
              icon={<IconSave size='1.25rem' />}
            />
          ) : null}
        </AnimatePresence>
      </form>
    </AnimateFade>
  );
}

export default FormConstituenta;
