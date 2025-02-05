'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { CstUpdateSchema, ICstUpdateDTO } from '@/backend/rsform/api';
import { useCstUpdate } from '@/backend/rsform/useCstUpdate';
import { useMutatingRSForm } from '@/backend/rsform/useMutatingRSForm';
import { IconChild, IconPredecessor, IconSave } from '@/components/Icons';
import { CProps } from '@/components/props';
import RefsInput from '@/components/RefsInput';
import Indicator from '@/components/ui/Indicator';
import Overlay from '@/components/ui/Overlay';
import SubmitButton from '@/components/ui/SubmitButton';
import TextArea from '@/components/ui/TextArea';
import { ConstituentaID, CstType, IConstituenta, IRSForm } from '@/models/rsform';
import { isBaseSet, isBasicConcept, isFunctional } from '@/models/rsformAPI';
import { IExpressionParse, ParsingStatus } from '@/models/rslang';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { errors, labelCstTypification, labelTypification } from '@/utils/labels';

import EditorRSExpression from '../EditorRSExpression';

interface FormConstituentaProps {
  id?: string;
  disabled: boolean;
  toggleReset: boolean;

  activeCst: IConstituenta;
  schema: IRSForm;
  onOpenEdit?: (cstID: ConstituentaID) => void;
}

function FormConstituenta({ disabled, id, toggleReset, schema, activeCst, onOpenEdit }: FormConstituentaProps) {
  const { cstUpdate } = useCstUpdate();
  const showTypification = useDialogsStore(state => state.showShowTypeGraph);
  const { isModified, setIsModified } = useModificationStore();
  const isProcessing = useMutatingRSForm();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isDirty }
  } = useForm<ICstUpdateDTO>({ resolver: zodResolver(CstUpdateSchema) });

  const [localParse, setLocalParse] = useState<IExpressionParse | undefined>(undefined);
  const typification = localParse
    ? labelTypification({
        isValid: localParse.parseResult,
        resultType: localParse.typification,
        args: localParse.args
      })
    : labelCstTypification(activeCst);

  const typeInfo = {
    alias: activeCst.alias,
    result: localParse ? localParse.typification : activeCst.parse.typification,
    args: localParse ? localParse.args : activeCst.parse.args
  };

  const [forceComment, setForceComment] = useState(false);
  const isBasic = isBasicConcept(activeCst.cst_type);
  const isElementary = isBaseSet(activeCst.cst_type);
  const showConvention = !!activeCst.convention || forceComment || isBasic;

  useEffect(() => {
    reset({
      target: activeCst.id,
      item_data: {
        convention: activeCst.convention,
        term_raw: activeCst.term_raw,
        definition_raw: activeCst.definition_raw,
        definition_formal: activeCst.definition_formal
      }
    });
    setForceComment(false);
    setLocalParse(undefined);
  }, [activeCst, schema, toggleReset, reset]);

  useLayoutEffect(() => {
    setIsModified(isDirty);
    return () => setIsModified(false);
  }, [isDirty, activeCst, setIsModified]);

  function onSubmit(data: ICstUpdateDTO) {
    cstUpdate({ itemID: schema.id, data }, () => reset({ ...data }));
  }

  function handleTypeGraph(event: CProps.EventMouse) {
    if ((localParse && !localParse.parseResult) || activeCst.parse.status !== ParsingStatus.VERIFIED) {
      toast.error(errors.typeStructureFailed);
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    showTypification({ items: typeInfo ? [typeInfo] : [] });
  }

  return (
    <form id={id} className='cc-column mt-1 px-6 py-1' onSubmit={event => void handleSubmit(onSubmit)(event)}>
      <Controller
        control={control}
        name='item_data.term_raw'
        render={({ field }) => (
          <RefsInput
            key='cst_term'
            id='cst_term'
            label='Термин'
            maxHeight='8rem'
            placeholder='Обозначение для текстовых определений'
            schema={schema}
            onOpenEdit={onOpenEdit}
            value={field.value}
            initialValue={activeCst.term_raw}
            resolved={activeCst.term_resolved}
            disabled={disabled}
            onChange={newValue => field.onChange(newValue)}
          />
        )}
      />

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

      {!!activeCst.definition_formal || !isElementary ? (
        <Controller
          control={control}
          name='item_data.definition_formal'
          render={({ field }) => (
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
                activeCst.cst_type !== CstType.STRUCTURED ? 'Родоструктурное выражение' : 'Типизация родовой структуры'
              }
              value={field.value ?? ''}
              activeCst={activeCst}
              disabled={disabled || activeCst.is_inherited}
              toggleReset={toggleReset}
              onChange={newValue => field.onChange(newValue)}
              onChangeLocalParse={setLocalParse}
              onOpenEdit={onOpenEdit}
              onShowTypeGraph={handleTypeGraph}
            />
          )}
        />
      ) : null}
      {!!activeCst.definition_raw || !isElementary ? (
        <Controller
          control={control}
          name='item_data.definition_raw'
          render={({ field }) => (
            <RefsInput
              id='cst_definition'
              label='Текстовое определение'
              placeholder='Текстовая интерпретация формального выражения'
              minHeight='3.75rem'
              maxHeight='8rem'
              schema={schema}
              onOpenEdit={onOpenEdit}
              value={field.value}
              initialValue={activeCst.definition_raw}
              resolved={activeCst.definition_resolved}
              disabled={disabled}
              onChange={newValue => field.onChange(newValue)}
            />
          )}
        />
      ) : null}

      {showConvention ? (
        <TextArea
          id='cst_convention'
          {...register('item_data.convention')}
          fitContent
          className='max-h-[8rem]'
          spellCheck
          label={isBasic ? 'Конвенция' : 'Комментарий'}
          placeholder={isBasic ? 'Договоренность об интерпретации' : 'Пояснение разработчика'}
          disabled={disabled || (isBasic && activeCst.is_inherited)}
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
    </form>
  );
}

export default FormConstituenta;
