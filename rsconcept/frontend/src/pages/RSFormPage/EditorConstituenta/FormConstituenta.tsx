'use client';

import clsx from 'clsx';
import { useEffect, useLayoutEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { IconChild, IconPredecessor, IconSave } from '@/components/Icons';
import { CProps } from '@/components/props';
import RefsInput from '@/components/RefsInput';
import Indicator from '@/components/ui/Indicator';
import Overlay from '@/components/ui/Overlay';
import SubmitButton from '@/components/ui/SubmitButton';
import TextArea from '@/components/ui/TextArea';
import { useRSForm } from '@/context/RSFormContext';
import DlgShowTypeGraph from '@/dialogs/DlgShowTypeGraph';
import { ConstituentaID, CstType, IConstituenta, ICstUpdateData } from '@/models/rsform';
import { isBaseSet, isBasicConcept, isFunctional } from '@/models/rsformAPI';
import { IExpressionParse, ParsingStatus } from '@/models/rslang';
import { errors, information, labelCstTypification } from '@/utils/labels';

import EditorRSExpression from '../EditorRSExpression';
import ControlsOverlay from './ControlsOverlay';

interface FormConstituentaProps {
  disabled: boolean;

  id?: string;
  state?: IConstituenta;

  isModified: boolean;
  toggleReset: boolean;
  setIsModified: (newValue: boolean) => void;

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

  const [term, setTerm] = useState(state?.term_raw ?? '');
  const [textDefinition, setTextDefinition] = useState(state?.definition_raw ?? '');
  const [expression, setExpression] = useState(state?.definition_formal ?? '');
  const [convention, setConvention] = useState(state?.convention ?? '');
  const [typification, setTypification] = useState('N/A');
  const [showTypification, setShowTypification] = useState(false);
  const [localParse, setLocalParse] = useState<IExpressionParse | undefined>(undefined);
  const typeInfo = state
    ? {
        alias: state.alias,
        result: localParse ? localParse.typification : state.parse.typification,
        args: localParse ? localParse.args : state.parse.args
      }
    : undefined;

  const [forceComment, setForceComment] = useState(false);

  const isBasic = !!state && isBasicConcept(state.cst_type);
  const isElementary = !!state && isBaseSet(state.cst_type);
  const showConvention = !state || !!state.convention || forceComment || isBasic;

  useEffect(() => {
    if (state) {
      setConvention(state.convention);
      setTerm(state.term_raw);
      setTextDefinition(state.definition_raw);
      setExpression(state.definition_formal);
      setTypification(state ? labelCstTypification(state) : 'N/A');
      setForceComment(false);
      setLocalParse(undefined);
    }
  }, [state, schema, toggleReset, setIsModified]);

  useLayoutEffect(() => {
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

  function handleTypeGraph(event: CProps.EventMouse) {
    if (!state || (localParse && !localParse.parseResult) || state.parse.status !== ParsingStatus.VERIFIED) {
      toast.error(errors.typeStructureFailed);
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    setShowTypification(true);
  }

  return (
    <div className='mx-0 md:mx-auto pt-[2rem] xs:pt-0'>
      {showTypification && state ? (
        <DlgShowTypeGraph items={typeInfo ? [typeInfo] : []} hideWindow={() => setShowTypification(false)} />
      ) : null}
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
      <form id={id} className={clsx('cc-column', 'mt-1 md:w-[48.8rem] shrink-0', 'px-6 py-1')} onSubmit={handleSubmit}>
        <RefsInput
          key='cst_term'
          id='cst_term'
          label='Термин'
          maxHeight='8rem'
          placeholder='Обозначение для текстовых определений'
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
            noOutline
            readOnly
            label='Типизация'
            value={typification}
            colors='clr-app clr-text-default cursor-default'
          />
        ) : null}
        {state ? (
          <>
            {!!state.definition_formal || !isElementary ? (
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
                  state.cst_type !== CstType.STRUCTURED ? 'Родоструктурное выражение' : 'Типизация родовой структуры'
                }
                value={expression}
                activeCst={state}
                disabled={disabled || state.is_inherited}
                toggleReset={toggleReset}
                onChangeExpression={newValue => setExpression(newValue)}
                onChangeTypification={setTypification}
                onChangeLocalParse={setLocalParse}
                onOpenEdit={onOpenEdit}
                onShowTypeGraph={handleTypeGraph}
              />
            ) : null}
            {!!state.definition_raw || !isElementary ? (
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
            ) : null}

            {showConvention ? (
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
            ) : null}

            {!showConvention && (!disabled || processing) ? (
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
            ) : null}

            {!disabled || processing ? (
              <div className='mx-auto flex'>
                <SubmitButton
                  key='cst_form_submit'
                  id='cst_form_submit'
                  text='Сохранить изменения'
                  disabled={disabled || !isModified}
                  icon={<IconSave size='1.25rem' />}
                />
                <Overlay position='top-[0.1rem] left-[0.4rem]' className='cc-icons'>
                  {state.has_inherited_children && !state.is_inherited ? (
                    <Indicator
                      icon={<IconPredecessor size='1.25rem' className='clr-text-primary' />}
                      titleHtml='Внимание!</br> Конституента имеет потомков<br/> в операционной схеме синтеза'
                    />
                  ) : null}
                  {state.is_inherited ? (
                    <Indicator
                      icon={<IconChild size='1.25rem' className='clr-text-primary' />}
                      titleHtml='Внимание!</br> Конституента является наследником<br/>'
                    />
                  ) : null}
                </Overlay>
              </div>
            ) : null}
          </>
        ) : null}
      </form>
    </div>
  );
}

export default FormConstituenta;
