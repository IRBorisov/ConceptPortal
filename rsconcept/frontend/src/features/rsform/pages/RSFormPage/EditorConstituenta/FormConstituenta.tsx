'use no memo'; // TODO: remove when react hook forms are compliant with react compiler
'use client';

import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { zodResolver } from '@hookform/resolvers/zod';

import { SubmitButton } from '@/components/Control';
import { IconChild, IconPredecessor, IconSave } from '@/components/Icons';
import { TextArea } from '@/components/Input';
import { Indicator } from '@/components/View';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { errorMsg } from '@/utils/labels';
import { promptUnsaved } from '@/utils/utils';

import {
  CstType,
  type ICstUpdateDTO,
  type IExpressionParseDTO,
  ParsingStatus,
  schemaCstUpdate
} from '../../../backend/types';
import { useCstUpdate } from '../../../backend/useCstUpdate';
import { useMutatingRSForm } from '../../../backend/useMutatingRSForm';
import { RefsInput } from '../../../components/RefsInput';
import { labelCstTypification, labelTypification } from '../../../labels';
import { type IConstituenta, type IRSForm } from '../../../models/rsform';
import { isBaseSet, isBasicConcept, isFunctional } from '../../../models/rsformAPI';
import { EditorRSExpression } from '../EditorRSExpression';

import { EditorControls } from './EditorControls';

interface FormConstituentaProps {
  id?: string;
  disabled: boolean;
  toggleReset: boolean;

  activeCst: IConstituenta;
  schema: IRSForm;
  onOpenEdit: (cstID: number) => void;
}

export function FormConstituenta({ disabled, id, toggleReset, schema, activeCst, onOpenEdit }: FormConstituentaProps) {
  const { isModified, setIsModified } = useModificationStore();
  const isProcessing = useMutatingRSForm();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isDirty }
  } = useForm<ICstUpdateDTO>({ resolver: zodResolver(schemaCstUpdate) });

  const { cstUpdate } = useCstUpdate();
  const showTypification = useDialogsStore(state => state.showShowTypeGraph);
  const showEditTerm = useDialogsStore(state => state.showEditWordForms);

  const [localParse, setLocalParse] = useState<IExpressionParseDTO | null>(null);

  const typification = useMemo(
    () =>
      localParse
        ? labelTypification({
            isValid: localParse.parseResult,
            resultType: localParse.typification,
            args: localParse.args
          })
        : labelCstTypification(activeCst),
    [localParse, activeCst]
  );

  const typeInfo = useMemo(
    () => ({
      alias: activeCst.alias,
      result: localParse ? localParse.typification : activeCst.parse.typification,
      args: localParse ? localParse.args : activeCst.parse.args
    }),
    [activeCst, localParse]
  );

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
    setLocalParse(null);
  }, [activeCst, schema, toggleReset, reset]);

  useLayoutEffect(() => {
    setIsModified(isDirty);
    return () => setIsModified(false);
  }, [isDirty, activeCst, setIsModified]);

  function onSubmit(data: ICstUpdateDTO) {
    return cstUpdate({ itemID: schema.id, data }).then(() => reset({ ...data }));
  }

  function handleTypeGraph(event: React.MouseEvent<Element>) {
    if ((localParse && !localParse.parseResult) || activeCst.parse.status !== ParsingStatus.VERIFIED) {
      toast.error(errorMsg.typeStructureFailed);
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    showTypification({ items: typeInfo ? [typeInfo] : [] });
  }

  function handleEditTermForms() {
    if (!activeCst) {
      return;
    }
    if (isModified && !promptUnsaved()) {
      return;
    }
    showEditTerm({ itemID: schema.id, target: activeCst });
  }

  return (
    <form id={id} className='relative cc-column mt-1 px-6 py-1' onSubmit={event => void handleSubmit(onSubmit)(event)}>
      <EditorControls disabled={disabled} constituenta={activeCst} onEditTerm={handleEditTermForms} />

      <Controller
        control={control}
        name='item_data.term_raw'
        render={({ field }) => (
          <RefsInput
            id='cst_term'
            label='Термин'
            maxHeight='8rem'
            placeholder='Обозначение для текстовых определений'
            schema={schema}
            onOpenEdit={onOpenEdit}
            value={field.value ?? ''}
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
        transparent
        noOutline
        readOnly
        label='Типизация'
        value={typification}
        className='clr-text-default cursor-default'
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
              value={field.value ?? ''}
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
          className='max-h-32'
          spellCheck
          label={isBasic ? 'Конвенция' : 'Комментарий'}
          placeholder={isBasic ? 'Договоренность об интерпретации' : 'Пояснение разработчика'}
          disabled={disabled || (isBasic && activeCst.is_inherited)}
        />
      ) : null}

      {!showConvention && (!disabled || isProcessing) ? (
        <button
          type='button'
          tabIndex={-1}
          className='self-start cc-label text-sec-600 hover:underline'
          onClick={() => setForceComment(true)}
        >
          Добавить комментарий
        </button>
      ) : null}

      {!disabled || isProcessing ? (
        <div className='relative mx-auto flex'>
          <SubmitButton
            text='Сохранить изменения'
            disabled={disabled || !isModified}
            icon={<IconSave size='1.25rem' />}
          />
          <div className='absolute z-pop top-1/2 -translate-y-1/2 left-full cc-icons'>
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
          </div>
        </div>
      ) : null}
    </form>
  );
}
