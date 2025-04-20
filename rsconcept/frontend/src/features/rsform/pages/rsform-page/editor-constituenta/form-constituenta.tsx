'use no memo'; // TODO: remove when react hook forms are compliant with react compiler
'use client';

import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { zodResolver } from '@hookform/resolvers/zod';

import { MiniButton, SubmitButton } from '@/components/control';
import { IconChild, IconEdit, IconPredecessor, IconSave } from '@/components/icons';
import { TextArea } from '@/components/input';
import { Indicator } from '@/components/view';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { errorMsg, tooltipText } from '@/utils/labels';
import { promptUnsaved } from '@/utils/utils';

import {
  CstType,
  type IExpressionParseDTO,
  type IUpdateConstituentaDTO,
  ParsingStatus,
  schemaUpdateConstituenta
} from '../../../backend/types';
import { useMutatingRSForm } from '../../../backend/use-mutating-rsform';
import { useUpdateConstituenta } from '../../../backend/use-update-constituenta';
import { RefsInput } from '../../../components/refs-input';
import { labelCstTypification, labelTypification } from '../../../labels';
import { type IConstituenta, type IRSForm } from '../../../models/rsform';
import { isBaseSet, isBasicConcept, isFunctional } from '../../../models/rsform-api';
import { EditorRSExpression } from '../editor-rsexpression';

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
  } = useForm<IUpdateConstituentaDTO>({ resolver: zodResolver(schemaUpdateConstituenta) });

  const { updateConstituenta: cstUpdate } = useUpdateConstituenta();
  const showTypification = useDialogsStore(state => state.showShowTypeGraph);
  const showEditTerm = useDialogsStore(state => state.showEditWordForms);
  const showRenameCst = useDialogsStore(state => state.showRenameCst);

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

  function onSubmit(data: IUpdateConstituentaDTO) {
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

  function handleRenameCst() {
    showRenameCst({ schema: schema, target: activeCst });
  }

  return (
    <form id={id} className='relative cc-column mt-1 px-6 py-1' onSubmit={event => void handleSubmit(onSubmit)(event)}>
      {!disabled || isProcessing ? (
        <MiniButton
          title={isModified ? tooltipText.unsaved : 'Редактировать словоформы термина'}
          aria-label='Редактировать словоформы термина'
          noHover
          onClick={handleEditTermForms}
          className='absolute z-pop top-0 left-[calc(7ch+4px)]'
          icon={<IconEdit size='1rem' className='icon-primary' />}
          disabled={isModified}
        />
      ) : null}

      <div className='absolute z-pop top-0 left-[calc(7ch+4px+3rem)] flex select-none'>
        <div className='pt-1 text-sm font-medium min-w-16 whitespace-nowrap select-text cursor-default'>
          <span>Имя </span>
          <span className='ml-1'>{activeCst?.alias ?? ''}</span>
        </div>
        {!disabled || isProcessing ? (
          <MiniButton
            title={isModified ? tooltipText.unsaved : 'Переименовать конституенту'}
            aria-label='Переименовать конституенту'
            noHover
            onClick={handleRenameCst}
            icon={<IconEdit size='1rem' className='icon-primary' />}
            disabled={isModified}
          />
        ) : null}
      </div>

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
            onChange={newValue => field.onChange(newValue)}
            disabled={disabled}
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
        transparent
        readOnly
        label='Типизация'
        value={typification}
        className='cursor-default'
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
              toggleReset={toggleReset}
              onChange={newValue => field.onChange(newValue)}
              onChangeLocalParse={setLocalParse}
              onOpenEdit={onOpenEdit}
              onShowTypeGraph={handleTypeGraph}
              disabled={disabled || activeCst.is_inherited}
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
              onChange={newValue => field.onChange(newValue)}
              disabled={disabled}
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
          className='self-start cc-label text-primary hover:underline select-none'
          onClick={() => setForceComment(true)}
        >
          Добавить комментарий
        </button>
      ) : null}

      {!disabled || isProcessing ? (
        <div className='relative mx-auto flex'>
          <SubmitButton
            text='Сохранить изменения'
            icon={<IconSave size='1.25rem' />}
            disabled={disabled || !isModified}
          />
          <div className='absolute z-pop top-1/2 -translate-y-1/2 left-full cc-icons'>
            {activeCst.has_inherited_children && !activeCst.is_inherited ? (
              <Indicator
                icon={<IconPredecessor size='1.25rem' className='text-primary' />}
                titleHtml='Внимание!</br> Конституента имеет потомков<br/> в операционной схеме синтеза'
              />
            ) : null}
            {activeCst.is_inherited ? (
              <Indicator
                icon={<IconChild size='1.25rem' className='text-primary' />}
                titleHtml='Внимание!</br> Конституента является наследником<br/>'
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </form>
  );
}
