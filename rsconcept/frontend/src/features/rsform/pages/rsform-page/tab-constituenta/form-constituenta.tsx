'use client';

import { useEffect, useEffectEvent, useLayoutEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useForm, useStore } from '@tanstack/react-form';

import { type AnalysisFull, TypeID } from '@/features/rslang';
import { labelType } from '@/features/rslang/labels';

import { MiniButton, SubmitButton } from '@/components/control';
import { TextButton } from '@/components/control/text-button';
import { IconChild, IconPredecessor, IconSave } from '@/components/icons';
import { Label, TextArea } from '@/components/input';
import { Indicator } from '@/components/view';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { errorMsg, tooltipText } from '@/utils/labels';
import { type RO } from '@/utils/meta';
import { withPreventDefault } from '@/utils/utils';

import { schemaUpdateConstituenta, type UpdateConstituentaDTO } from '../../../backend/types';
import { EditorRSExpression } from '../../../components/editor-rsexpression';
import { IconCrucialValue } from '../../../components/icon-crucial-value';
import { RefsInput } from '../../../components/refs-input';
import { SelectMultiConstituenta } from '../../../components/select-multi-constituenta';
import {
  getRSDefinitionPlaceholder,
  labelRSExpression
} from '../../../labels';
import { type Constituenta, CstType, type RSForm } from '../../../models/rsform';
import { cstCanProduceStructure, getAnalysisFor, isBaseSet, isBasicConcept } from '../../../models/rsform-api';
import { useRSFormEdit } from '../rsedit-context';

interface FormConstituentaProps {
  id?: string;
  disabled: boolean;
  toggleReset: boolean;

  activeCst: Constituenta;
  schema: RSForm;
  onOpenEdit: (cstID: number) => void;
}

function constituentaDefaults(activeCst: Constituenta): UpdateConstituentaDTO {
  return {
    target: activeCst.id,
    item_data: {
      convention: activeCst.convention,
      term_raw: activeCst.term_raw,
      definition_raw: activeCst.definition_raw,
      definition_formal: activeCst.definition_formal
    }
  };
}

export function FormConstituenta({ disabled, id, toggleReset, schema, activeCst, onOpenEdit }: FormConstituentaProps) {
  const isModified = useModificationStore(state => state.isModified);
  const setIsModified = useModificationStore(state => state.setIsModified);
  const onModifiedEvent = useEffectEvent(setIsModified);
  const {
    toggleCrucial,
    patchConstituenta,
    createCstFromData: createStructurePlannerConstituenta,
    openTermEditor,
    promptRename,
    addAttribution,
    removeAttribution,
    clearAttributions,
    isProcessing
  } = useRSFormEdit();
  const showTypification = useDialogsStore(state => state.showShowTypeGraph);
  const showStructurePlanner = useDialogsStore(state => state.showStructurePlanner);

  function handleAddAttribution(attribute: Constituenta) {
    addAttribution(activeCst.id, attribute.id);
  }

  const form = useForm({
    defaultValues: constituentaDefaults(activeCst),
    validators: {
      onChange: schemaUpdateConstituenta
    },
    onSubmit: async ({ value, formApi }) => {
      await patchConstituenta(value);
      setIsModified(false);
      formApi.reset(value);
    }
  });

  const onResetEvent = useEffectEvent((next: UpdateConstituentaDTO) => {
    form.reset(next);
  });

  const definition = useStore(
    form.store,
    state => state.values.item_data.definition_formal
  );
  const isDefaultValue = useStore(form.store, state => state.isDefaultValue);

  const [forceComment, setForceComment] = useState(false);
  const [localParse, setLocalParse] = useState<RO<AnalysisFull> | null>(null);

  const typification = localParse ? labelType(localParse.type) : labelType(activeCst.analysis.type);

  const attributions = activeCst.attributes.map(id => schema.cstByID.get(id)!);

  const isBasic = isBasicConcept(activeCst.cst_type) || activeCst.cst_type === CstType.NOMINAL;
  const isElementary = isBaseSet(activeCst.cst_type);
  const showConvention = !!activeCst.convention || forceComment || isBasic;

  useLayoutEffect(function resetGlobalModifiedFlagOnCstChange() {
    onModifiedEvent(false);
  }, [activeCst.id]);

  useEffect(function resetFormOnCstChange() {
    onResetEvent(constituentaDefaults(activeCst));
  }, [activeCst, toggleReset]);

  useEffect(function resetUIStateOnCstChange() {
    const timeoutId = setTimeout(function resetConstituentaUIState() {
      setForceComment(false);
      setLocalParse(null);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [activeCst.id, toggleReset, schema]);

  useEffect(function syncGlobalModified() {
    onModifiedEvent(!isDefaultValue);
  }, [isDefaultValue]);

  function handleTypeGraph(event: React.MouseEvent<Element>) {
    event.stopPropagation();
    event.preventDefault();

    if (!definition) {
      toast.error(errorMsg.typeStructureFailed);
      return;
    }
    const parse = getAnalysisFor(definition, activeCst.cst_type, schema);
    if (!parse.type || parse.type.typeID === TypeID.logic) {
      toast.error(errorMsg.typeStructureFailed);
      return;
    }
    showTypification({ items: [{ alias: activeCst.alias, type: parse.type }] });
  }

  function handleStructurePlanner() {
    showStructurePlanner({
      schema: schema,
      targetID: activeCst.spawner_path ? activeCst.spawner! : activeCst.id,
      isMutable: !disabled,
      onCreate: createStructurePlannerConstituenta,
      onUpdate: patchConstituenta
    });
  }

  return (
    <form
      id={id}
      className='relative cc-column mt-1 px-6 pb-1 pt-8'
      onSubmit={withPreventDefault(() => void form.handleSubmit())}
    >
      <div className='absolute z-pop top-0 left-6 flex select-text font-medium whitespace-nowrap pt-1'>
        <TextButton
          text='Термин'
          title={disabled ? undefined : isModified ? tooltipText.unsaved : 'Редактировать словоформы термина'}
          onClick={openTermEditor}
          disabled={isModified || disabled}
        />

        <MiniButton
          title={activeCst.crucial ? 'Ключевая: да' : 'Ключевая: нет'}
          className='ml-6 mr-1 -mt-0.75'
          aria-label='Переключатель статуса ключевой конституенты'
          icon={<IconCrucialValue size='1rem' value={activeCst.crucial} />}
          onClick={toggleCrucial}
          disabled={disabled || isProcessing || isModified}
        />

        <TextButton
          text='Имя'
          title={disabled ? undefined : isModified ? tooltipText.unsaved : 'Переименовать конституенту'}
          onClick={promptRename}
          disabled={isModified || disabled}
        />
        <div className='ml-2 text-sm font-medium whitespace-nowrap select-text cursor-default'>
          {activeCst?.alias ?? ''}
        </div>
      </div>

      <form.Field name='item_data.term_raw'>
        {field => (
          <RefsInput
            id='cst_term'
            aria-label='Термин'
            maxHeight='8rem'
            placeholder={disabled ? '' : 'Обозначение для текстовых определений'}
            schema={schema}
            onOpenEdit={onOpenEdit}
            value={field.state.value ?? ''}
            initialValue={activeCst.term_raw}
            resolved={activeCst.term_resolved}
            onChange={newValue => field.handleChange(newValue)}
            disabled={disabled}
          />
        )}
      </form.Field>

      {activeCst.cst_type === CstType.NOMINAL || activeCst.attributes.length > 0 ? (
        <div className='flex flex-col gap-1'>
          <Label text='Атрибутирующие конституенты' />
          <SelectMultiConstituenta
            items={schema.items.filter(item => item.id !== activeCst.id)}
            value={attributions}
            onAdd={handleAddAttribution}
            onClear={clearAttributions}
            onRemove={removeAttribution}
            disabled={disabled || isModified}
            placeholder={disabled ? '' : 'Выберите конституенты'}
          />
        </div>
      ) : null}

      {activeCst.cst_type !== CstType.NOMINAL ? (
        <div className='flex'>
          <TextButton
            text='Типизация'
            title='Управление структурой термина'
            disabled={!activeCst.spawner_path && !cstCanProduceStructure(activeCst)}
            onClick={handleStructurePlanner}
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
            value={typification}
            className='cursor-default'
          />
        </div>
      ) : null}

      {!!activeCst.definition_formal || !isElementary ? (
        <form.Field name='item_data.definition_formal'>
          {field => (
            <EditorRSExpression
              id='cst_expression'
              label={labelRSExpression(activeCst.cst_type)}
              placeholder={disabled ? '' : getRSDefinitionPlaceholder(activeCst.cst_type)}
              value={field.state.value ?? ''}
              schema={schema}
              activeCst={activeCst}
              isProcessing={isProcessing}
              toggleReset={toggleReset}
              onChange={newValue => field.handleChange(newValue)}
              analysis={localParse}
              onAnalysis={setLocalParse}
              onOpenEdit={onOpenEdit}
              onShowTypeGraph={handleTypeGraph}
              disabled={disabled || activeCst.is_inherited}
            />
          )}
        </form.Field>
      ) : null}
      {!!activeCst.definition_raw || !isElementary ? (
        <form.Field name='item_data.definition_raw'>
          {field => (
            <RefsInput
              id='cst_definition'
              label='Текстовое определение'
              placeholder={disabled ? '' : 'Текстовая интерпретация формального выражения'}
              minHeight='3.75rem'
              maxHeight='8rem'
              schema={schema}
              onOpenEdit={onOpenEdit}
              value={field.state.value ?? ''}
              initialValue={activeCst.definition_raw}
              resolved={activeCst.definition_resolved}
              onChange={newValue => field.handleChange(newValue)}
              disabled={disabled}
            />
          )}
        </form.Field>
      ) : null}

      {showConvention ? (
        <form.Field name='item_data.convention'>
          {field => (
            <TextArea
              id='cst_convention'
              fitContent
              areaClassName='disabled:min-h-9 max-h-32'
              spellCheck
              label={isBasic ? 'Конвенция' : 'Комментарий'}
              placeholder={disabled ? '' : isBasic ? 'Договоренность об интерпретации' : 'Пояснение разработчика'}
              disabled={disabled || (isBasic && activeCst.is_inherited)}
              value={field.state.value ?? ''}
              onChange={event => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors[0]?.message}
            />
          )}
        </form.Field>
      ) : null}

      {!showConvention && (!disabled || isProcessing) ? (
        <TextButton
          text='Добавить комментарий'
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
