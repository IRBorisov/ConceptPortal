'use no memo'; // TODO: remove when react hook forms are compliant with react compiler
'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { zodResolver } from '@hookform/resolvers/zod';

import { MiniButton, SubmitButton } from '@/components/control';
import { TextButton } from '@/components/control/text-button';
import { IconChild, IconPredecessor, IconSave } from '@/components/icons';
import { Label, TextArea } from '@/components/input';
import { Indicator } from '@/components/view';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { errorMsg, tooltipText } from '@/utils/labels';
import { type RO } from '@/utils/meta';
import { promptUnsaved } from '@/utils/utils';

import {
  CstType,
  type IExpressionParseDTO,
  type IUpdateConstituentaDTO,
  ParsingStatus,
  schemaUpdateConstituenta
} from '../../../backend/types';
import { useClearAttributions } from '../../../backend/use-clear-attributions';
import { useCreateAttribution } from '../../../backend/use-create-attribution';
import { useDeleteAttribution } from '../../../backend/use-delete-attribution';
import { useMutatingRSForm } from '../../../backend/use-mutating-rsform';
import { useUpdateConstituenta } from '../../../backend/use-update-constituenta';
import { useUpdateCrucial } from '../../../backend/use-update-crucial';
import { IconCrucialValue } from '../../../components/icon-crucial-value';
import { RefsInput } from '../../../components/refs-input';
import { SelectMultiConstituenta } from '../../../components/select-multi-constituenta';
import {
  getRSDefinitionPlaceholder,
  labelCstTypification,
  labelRSExpression,
  labelTypification
} from '../../../labels';
import { type IConstituenta, type IRSForm } from '../../../models/rsform';
import { isBaseSet, isBasicConcept } from '../../../models/rsform-api';
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
  const isModified = useModificationStore(state => state.isModified);
  const setIsModified = useModificationStore(state => state.setIsModified);
  const isProcessing = useMutatingRSForm();

  const { updateConstituenta } = useUpdateConstituenta();
  const { updateCrucial } = useUpdateCrucial();
  const { createAttribution } = useCreateAttribution();
  const { deleteAttribution } = useDeleteAttribution();
  const { clearAttributions } = useClearAttributions();
  const showTypification = useDialogsStore(state => state.showShowTypeGraph);
  const showEditTerm = useDialogsStore(state => state.showEditWordForms);
  const showRenameCst = useDialogsStore(state => state.showRenameCst);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isDirty }
  } = useForm<IUpdateConstituentaDTO>({
    resolver: zodResolver(schemaUpdateConstituenta),
    defaultValues: {
      target: activeCst.id,
      item_data: {
        convention: activeCst.convention,
        term_raw: activeCst.term_raw,
        definition_raw: activeCst.definition_raw,
        definition_formal: activeCst.definition_formal
      }
    }
  });
  const [forceComment, setForceComment] = useState(false);
  const [localParse, setLocalParse] = useState<RO<IExpressionParseDTO> | null>(null);

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
    () =>
      activeCst.parse
        ? {
            alias: activeCst.alias,
            result: localParse ? localParse.typification : activeCst.parse.typification,
            args: localParse ? localParse.args : activeCst.parse.args
          }
        : null,
    [activeCst, localParse]
  );

  const associations = useMemo(
    () => activeCst.attributes.map(id => schema.cstByID.get(id)!),
    [activeCst.attributes, schema.cstByID]
  );

  const isBasic = isBasicConcept(activeCst.cst_type) || activeCst.cst_type === CstType.NOMINAL;
  const isElementary = isBaseSet(activeCst.cst_type);
  const showConvention = !!activeCst.convention || forceComment || isBasic;

  const prevActiveCstID = useRef(activeCst.id);
  const prevToggleReset = useRef(toggleReset);
  const prevSchema = useRef(schema);
  if (
    prevActiveCstID.current !== activeCst.id ||
    prevToggleReset.current !== toggleReset ||
    prevSchema.current !== schema
  ) {
    prevActiveCstID.current = activeCst.id;
    prevToggleReset.current = toggleReset;
    prevSchema.current = schema;
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
  }

  useLayoutEffect(() => setIsModified(false), [activeCst.id, setIsModified]);

  const prevDirty = useRef(isDirty);
  if (prevDirty.current !== isDirty) {
    prevDirty.current = isDirty;
    setIsModified(isDirty);
  }

  function onSubmit(data: IUpdateConstituentaDTO) {
    void updateConstituenta({ itemID: schema.id, data }).then(() => {
      setIsModified(false);
      reset({ ...data });
    });
  }

  function handleTypeGraph(event: React.MouseEvent<Element>) {
    if (
      (localParse && !localParse.parseResult) ||
      !activeCst.parse ||
      activeCst.parse.status !== ParsingStatus.VERIFIED
    ) {
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
    showEditTerm({ itemID: schema.id, targetID: activeCst.id });
  }

  function handleRenameCst() {
    showRenameCst({ schemaID: schema.id, targetID: activeCst.id });
  }

  function handleToggleCrucial() {
    void updateCrucial({
      itemID: schema.id,
      data: {
        target: [activeCst.id],
        value: !activeCst.crucial
      }
    });
  }

  function handleAddAttribution(item: IConstituenta) {
    void createAttribution({
      itemID: schema.id,
      data: {
        container: activeCst.id,
        attribute: item.id
      }
    });
  }

  function handleRemoveAttribution(item: IConstituenta) {
    void deleteAttribution({
      itemID: schema.id,
      data: {
        container: activeCst.id,
        attribute: item.id
      }
    });
  }

  function handleClearAttributions() {
    void clearAttributions({
      itemID: schema.id,
      data: {
        target: activeCst.id
      }
    });
  }

  return (
    <form
      id={id}
      className='relative cc-column mt-1 px-6 pb-1 pt-8'
      onSubmit={event => void handleSubmit(onSubmit)(event)}
    >
      <div className='absolute z-pop top-0 left-6 flex select-text font-medium whitespace-nowrap pt-1'>
        <TextButton
          text='Термин' //
          title={disabled ? undefined : isModified ? tooltipText.unsaved : 'Редактировать словоформы термина'}
          onClick={handleEditTermForms}
          disabled={isModified || disabled}
        />

        <MiniButton
          title={activeCst.crucial ? 'Ключевая: да' : 'Ключевая: нет'}
          className='ml-6 mr-1 -mt-0.75'
          aria-label='Переключатель статуса ключевой конституенты'
          icon={<IconCrucialValue size='1rem' value={activeCst.crucial} />}
          onClick={handleToggleCrucial}
          disabled={disabled || isProcessing || isModified}
        />

        <TextButton
          text='Имя' //
          title={disabled ? undefined : isModified ? tooltipText.unsaved : 'Переименовать конституенту'}
          onClick={handleRenameCst}
          disabled={isModified || disabled}
        />
        <div className='ml-2 text-sm font-medium whitespace-nowrap select-text cursor-default'>
          {activeCst?.alias ?? ''}
        </div>
      </div>

      <Controller
        control={control}
        name='item_data.term_raw'
        render={({ field }) => (
          <RefsInput
            id='cst_term'
            aria-label='Термин'
            maxHeight='8rem'
            placeholder={disabled ? '' : 'Обозначение для текстовых определений'}
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

      {activeCst.cst_type === CstType.NOMINAL || activeCst.attributes.length > 0 ? (
        <div className='flex flex-col gap-1'>
          <Label text='Атрибутирующие конституенты' />
          <SelectMultiConstituenta
            items={schema.items.filter(item => item.id !== activeCst.id)}
            value={associations}
            onAdd={handleAddAttribution}
            onClear={handleClearAttributions}
            onRemove={handleRemoveAttribution}
            disabled={disabled || isModified}
            placeholder={disabled ? '' : 'Выберите конституенты'}
          />
        </div>
      ) : null}

      {activeCst.cst_type !== CstType.NOMINAL ? (
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
      ) : null}

      {!!activeCst.definition_formal || !isElementary ? (
        <Controller
          control={control}
          name='item_data.definition_formal'
          render={({ field }) => (
            <EditorRSExpression
              id='cst_expression'
              label={labelRSExpression(activeCst.cst_type)}
              placeholder={disabled ? '' : getRSDefinitionPlaceholder(activeCst.cst_type)}
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
              placeholder={disabled ? '' : 'Текстовая интерпретация формального выражения'}
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
          className='disabled:min-h-9 max-h-32'
          spellCheck
          label={isBasic ? 'Конвенция' : 'Комментарий'}
          placeholder={disabled ? '' : isBasic ? 'Договоренность об интерпретации' : 'Пояснение разработчика'}
          disabled={disabled || (isBasic && activeCst.is_inherited)}
        />
      ) : null}

      {!showConvention && (!disabled || isProcessing) ? (
        <TextButton
          text='Добавить комментарий' //
          onClick={() => setForceComment(true)}
        />
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
