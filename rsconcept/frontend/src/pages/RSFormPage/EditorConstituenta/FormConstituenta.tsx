'use client';

import clsx from 'clsx';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { IconChild, IconPredecessor, IconSave } from '@/components/Icons';
import RefsInput from '@/components/RefsInput';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import SubmitButton from '@/components/ui/SubmitButton';
import TextArea from '@/components/ui/TextArea';
import AnimateFade from '@/components/wrap/AnimateFade';
import { useRSForm } from '@/context/RSFormContext';
import { ConstituentaID, CstType, IConstituenta, ICstUpdateData } from '@/models/rsform';
import { isBaseSet, isBasicConcept, isFunctional } from '@/models/rsformAPI';
import { information, labelCstTypification } from '@/utils/labels';

import EditorRSExpression from '../EditorRSExpression';
import ControlsOverlay from './ControlsOverlay';

interface FormConstituentaProps {
  disabled: boolean;

  id?: string;
  state?: IConstituenta;

  isModified: boolean;
  toggleReset: boolean;
  setIsModified: React.Dispatch<React.SetStateAction<boolean>>;

  onRename: () => void;
  onEditTerm: () => void;
  onOpenEdit?: (cstID: ConstituentaID) => void;
}

function FormConstituenta({
  disabled,
  id,
  state,

  isModified,
  setIsModified,

  toggleReset,
  onRename,
  onEditTerm,
  onOpenEdit
}: FormConstituentaProps) {
  const { schema, cstUpdate, processing } = useRSForm();

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
      target: state.id,
      item_data: {}
    };
    if (state.term_raw !== term) {
      data.item_data.term_raw = term;
    }
    if (state.definition_formal !== expression) {
      data.item_data.definition_formal = expression;
    }
    if (state.definition_raw !== textDefinition) {
      data.item_data.definition_raw = textDefinition;
    }
    if (state.convention !== convention) {
      data.item_data.convention = convention;
    }
    cstUpdate(data, () => toast.success(information.changesSaved));
  }

  return (
    <AnimateFade className='mx-0 md:mx-auto pt-[2rem] xs:pt-0'>
      {state ? (
        <ControlsOverlay
          disabled={disabled}
          modified={isModified}
          processing={processing}
          constituenta={state}
          onEditTerm={onEditTerm}
          onRename={onRename}
        />
      ) : null}
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
          onOpenEdit={onOpenEdit}
          value={term}
          initialValue={state?.term_raw ?? ''}
          resolved={state?.term_resolved ?? 'Конституента не выбрана'}
          disabled={disabled}
          onChange={newValue => setTerm(newValue)}
        />
        {state ? (
          <TextArea
            id='cst_typification'
            fitContent
            dense
            noResize
            noBorder
            disabled={true}
            label='Типизация'
            value={typification}
            colors='clr-app clr-text-default'
          />
        ) : null}
        {state ? (
          <AnimatePresence>
            <AnimateFade key='cst_expression_fade' hideContent={!state.definition_formal && isElementary}>
              <EditorRSExpression
                id='cst_expression'
                label={
                  state.cst_type === CstType.STRUCTURED
                    ? 'Область определения'
                    : isFunctional(state.cst_type)
                    ? 'Определение функции'
                    : 'Формальное определение'
                }
                placeholder={
                  state.cst_type !== CstType.STRUCTURED
                    ? 'Родоструктурное выражение'
                    : 'Определение множества, которому принадлежат элементы родовой структуры'
                }
                value={expression}
                activeCst={state}
                disabled={disabled || state.is_inherited}
                toggleReset={toggleReset}
                onChange={newValue => setExpression(newValue)}
                setTypification={setTypification}
                onOpenEdit={onOpenEdit}
              />
            </AnimateFade>
            <AnimateFade key='cst_definition_fade' hideContent={!state.definition_raw && isElementary}>
              <RefsInput
                id='cst_definition'
                label='Текстовое определение'
                placeholder='Текстовая интерпретация формального выражения'
                minHeight='3.75rem'
                maxHeight='8rem'
                schema={schema}
                onOpenEdit={onOpenEdit}
                value={textDefinition}
                initialValue={state.definition_raw}
                resolved={state.definition_resolved}
                disabled={disabled}
                onChange={newValue => setTextDefinition(newValue)}
              />
            </AnimateFade>
            <AnimateFade key='cst_convention_fade' hideContent={!showConvention}>
              <TextArea
                id='cst_convention'
                fitContent
                className='max-h-[8rem]'
                spellCheck
                label={isBasic ? 'Конвенция' : 'Комментарий'}
                placeholder={isBasic ? 'Договоренность об интерпретации' : 'Пояснение разработчика'}
                value={convention}
                disabled={disabled || (isBasic && state.is_inherited)}
                onChange={event => setConvention(event.target.value)}
              />
            </AnimateFade>
            <AnimateFade key='cst_convention_button' hideContent={showConvention || (disabled && !processing)}>
              <button
                key='cst_disable_comment'
                id='cst_disable_comment'
                type='button'
                tabIndex={-1}
                className='self-start cc-label clr-text-url hover:underline'
                onClick={() => setForceComment(true)}
              >
                Добавить комментарий
              </button>
            </AnimateFade>

            {!disabled || processing ? (
              <div className='self-center flex'>
                <SubmitButton
                  key='cst_form_submit'
                  id='cst_form_submit'
                  text='Сохранить изменения'
                  disabled={disabled || !isModified}
                  icon={<IconSave size='1.25rem' />}
                />
                <Overlay position='top-[0.1rem] left-[0.4rem]' className='cc-icons'>
                  {state.is_inherited_parent && !state.is_inherited ? (
                    <MiniButton
                      icon={<IconPredecessor size='1.25rem' className='clr-text-primary' />}
                      disabled
                      titleHtml='Внимание!</br> Конституента имеет потомков<br/> в операционной схеме синтеза'
                    />
                  ) : null}
                  {state.is_inherited ? (
                    <MiniButton
                      icon={<IconChild size='1.25rem' className='clr-text-primary' />}
                      disabled
                      titleHtml='Внимание!</br> Конституента является наследником<br/>'
                    />
                  ) : null}
                </Overlay>
              </div>
            ) : null}
          </AnimatePresence>
        ) : null}
      </form>
    </AnimateFade>
  );
}

export default FormConstituenta;
