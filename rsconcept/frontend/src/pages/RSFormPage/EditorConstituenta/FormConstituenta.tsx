'use client';

import clsx from 'clsx';
import { useEffect, useLayoutEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { ICstUpdateDTO } from '@/backend/rsform/api';
import { useCstUpdate } from '@/backend/rsform/useCstUpdate';
import { useIsProcessingRSForm } from '@/backend/rsform/useIsProcessingRSForm';
import { IconChild, IconPredecessor, IconSave } from '@/components/Icons';
import { CProps } from '@/components/props';
import RefsInput from '@/components/RefsInput';
import Indicator from '@/components/ui/Indicator';
import Overlay from '@/components/ui/Overlay';
import SubmitButton from '@/components/ui/SubmitButton';
import TextArea from '@/components/ui/TextArea';
import { ConstituentaID, CstType } from '@/models/rsform';
import { isBaseSet, isBasicConcept, isFunctional } from '@/models/rsformAPI';
import { IExpressionParse, ParsingStatus } from '@/models/rslang';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { errors, information, labelCstTypification } from '@/utils/labels';

import EditorRSExpression from '../EditorRSExpression';
import { useRSEdit } from '../RSEditContext';
import EditorControls from './EditorControls';

interface FormConstituentaProps {
  id?: string;
  disabled: boolean;
  toggleReset: boolean;

  onEditTerm: () => void;
  onOpenEdit?: (cstID: ConstituentaID) => void;
}

function FormConstituenta({
  disabled,
  id,

  toggleReset,
  onEditTerm,
  onOpenEdit
}: FormConstituentaProps) {
  const { cstUpdate } = useCstUpdate();
  const { schema, activeCst } = useRSEdit();
  const { isModified, setIsModified } = useModificationStore();
  const isProcessing = useIsProcessingRSForm();

  const [term, setTerm] = useState(activeCst?.term_raw ?? '');
  const [textDefinition, setTextDefinition] = useState(activeCst?.definition_raw ?? '');
  const [expression, setExpression] = useState(activeCst?.definition_formal ?? '');
  const [convention, setConvention] = useState(activeCst?.convention ?? '');
  const [typification, setTypification] = useState('N/A');
  const [localParse, setLocalParse] = useState<IExpressionParse | undefined>(undefined);
  const typeInfo = activeCst
    ? {
        alias: activeCst.alias,
        result: localParse ? localParse.typification : activeCst.parse.typification,
        args: localParse ? localParse.args : activeCst.parse.args
      }
    : undefined;

  const [forceComment, setForceComment] = useState(false);

  const isBasic = !!activeCst && isBasicConcept(activeCst.cst_type);
  const isElementary = !!activeCst && isBaseSet(activeCst.cst_type);
  const showConvention = !activeCst || !!activeCst.convention || forceComment || isBasic;

  const showTypification = useDialogsStore(activeCst => activeCst.showShowTypeGraph);

  useEffect(() => {
    if (activeCst) {
      setConvention(activeCst.convention);
      setTerm(activeCst.term_raw);
      setTextDefinition(activeCst.definition_raw);
      setExpression(activeCst.definition_formal);
      setTypification(activeCst ? labelCstTypification(activeCst) : 'N/A');
      setForceComment(false);
      setLocalParse(undefined);
    }
  }, [activeCst, schema, toggleReset, setIsModified]);

  useLayoutEffect(() => {
    if (!activeCst) {
      setIsModified(false);
      return;
    }
    setIsModified(
      activeCst.term_raw !== term ||
        activeCst.definition_raw !== textDefinition ||
        activeCst.convention !== convention ||
        activeCst.definition_formal !== expression
    );
    return () => setIsModified(false);
  }, [
    activeCst,
    activeCst?.term_raw,
    activeCst?.definition_formal,
    activeCst?.definition_raw,
    activeCst?.convention,
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
    if (!activeCst || isProcessing || !schema) {
      return;
    }
    const data: ICstUpdateDTO = {
      target: activeCst.id,
      item_data: {
        term_raw: activeCst.term_raw !== term ? term : undefined,
        definition_formal: activeCst.definition_formal !== expression ? expression : undefined,
        definition_raw: activeCst.definition_raw !== textDefinition ? textDefinition : undefined,
        convention: activeCst.convention !== convention ? convention : undefined
      }
    };
    cstUpdate({ itemID: schema.id, data }, () => toast.success(information.changesSaved));
  }

  function handleTypeGraph(event: CProps.EventMouse) {
    if (!activeCst || (localParse && !localParse.parseResult) || activeCst.parse.status !== ParsingStatus.VERIFIED) {
      toast.error(errors.typeStructureFailed);
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    showTypification({ items: typeInfo ? [typeInfo] : [] });
  }

  return (
    <div className='mx-0 md:mx-auto pt-[2rem] xs:pt-0'>
      {activeCst ? <EditorControls disabled={disabled} constituenta={activeCst} onEditTerm={onEditTerm} /> : null}
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
          initialValue={activeCst?.term_raw ?? ''}
          resolved={activeCst?.term_resolved ?? 'Конституента не выбрана'}
          disabled={disabled}
          onChange={newValue => setTerm(newValue)}
        />
        {activeCst ? (
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
            colors='bg-transparent clr-text-default cursor-default'
          />
        ) : null}
        {activeCst ? (
          <>
            {!!activeCst.definition_formal || !isElementary ? (
              <EditorRSExpression
                id='cst_expression'
                label={
                  activeCst.cst_type === CstType.STRUCTURED
                    ? 'Область определения'
                    : isFunctional(activeCst.cst_type)
                    ? 'Определение функции'
                    : 'Формальное определение'
                }
                placeholder={
                  activeCst.cst_type !== CstType.STRUCTURED
                    ? 'Родоструктурное выражение'
                    : 'Типизация родовой структуры'
                }
                value={expression}
                activeCst={activeCst}
                disabled={disabled || activeCst.is_inherited}
                toggleReset={toggleReset}
                onChangeExpression={newValue => setExpression(newValue)}
                onChangeTypification={setTypification}
                onChangeLocalParse={setLocalParse}
                onOpenEdit={onOpenEdit}
                onShowTypeGraph={handleTypeGraph}
              />
            ) : null}
            {!!activeCst.definition_raw || !isElementary ? (
              <RefsInput
                id='cst_definition'
                label='Текстовое определение'
                placeholder='Текстовая интерпретация формального выражения'
                minHeight='3.75rem'
                maxHeight='8rem'
                schema={schema}
                onOpenEdit={onOpenEdit}
                value={textDefinition}
                initialValue={activeCst.definition_raw}
                resolved={activeCst.definition_resolved}
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
                disabled={disabled || (isBasic && activeCst.is_inherited)}
                onChange={event => setConvention(event.target.value)}
              />
            ) : null}

            {!showConvention && (!disabled || isProcessing) ? (
              <button
                key='cst_disable_comment'
                id='cst_disable_comment'
                type='button'
                tabIndex={-1}
                className='self-start cc-label text-sec-600 hover:underline'
                onClick={() => setForceComment(true)}
              >
                Добавить комментарий
              </button>
            ) : null}

            {!disabled || isProcessing ? (
              <div className='mx-auto flex'>
                <SubmitButton
                  key='cst_form_submit'
                  id='cst_form_submit'
                  text='Сохранить изменения'
                  disabled={disabled || !isModified}
                  icon={<IconSave size='1.25rem' />}
                />
                <Overlay position='top-[0.1rem] left-[0.4rem]' className='cc-icons'>
                  {activeCst.has_inherited_children && !activeCst.is_inherited ? (
                    <Indicator
                      icon={<IconPredecessor size='1.25rem' className='text-sec-600' />}
                      titleHtml='Внимание!</br> Конституента имеет потомков<br/> в операционной схеме синтеза'
                    />
                  ) : null}
                  {activeCst.is_inherited ? (
                    <Indicator
                      icon={<IconChild size='1.25rem' className='text-sec-600' />}
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
