'use client';

import { useEffect, useEffectEvent, useLayoutEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useForm, useStore } from '@tanstack/react-form';
import clsx from 'clsx';

import { type Constituenta, CstType, type RSForm } from '@/domain/library';
import { getAnalysisFor, isBaseSet, isBasicConcept, isLogical } from '@/domain/library/rsform-api';
import { type AnalysisFull, TypeID } from '@/domain/rslang';
import { labelType } from '@/domain/rslang/labels';

import { TextButton } from '@/components/control/text-button';
import { Label, TextArea } from '@/components/input';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { errorMsg, tooltipText } from '@/utils/labels';
import { type RO } from '@/utils/meta';
import { withPreventDefault } from '@/utils/utils';

import { schemaUpdateConstituenta, type UpdateConstituentaDTO } from '../../../backend/types';
import { EditorRSExpression } from '../../../components/editor-rsexpression';
import { RefsInput } from '../../../components/refs-input';
import { SelectMultiConstituenta } from '../../../components/select-multi-constituenta';
import { getRSDefinitionPlaceholder, labelRSExpression } from '../../../labels';
import { useSchemaEdit } from '../schema-edit-context';

import { ConstituentaPrimaryActions, isConstituentaEditorDisabled } from './cst-primary-actions';

interface FormConstituentaProps {
  id?: string;
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

export function FormConstituenta({ id, toggleReset, schema, activeCst, onOpenEdit }: FormConstituentaProps) {
  const isModified = useModificationStore(state => state.isModified);
  const setIsModified = useModificationStore(state => state.setIsModified);
  const onModifiedEvent = useEffectEvent(setIsModified);
  const {
    patchConstituenta,
    createCstFromData,
    openTermEditor,
    addAttribution,
    removeAttribution,
    clearAttributions,
    isProcessing,
    isContentEditable
  } = useSchemaEdit();
  const showTypification = useDialogsStore(state => state.showShowTypeGraph);
  const disabled = isConstituentaEditorDisabled(activeCst, isContentEditable);

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

  const definition = useStore(form.store, state => state.values.item_data.definition_formal);
  const isDefaultValue = useStore(form.store, state => state.isDefaultValue);

  const [forceComment, setForceComment] = useState(false);
  const [localParse, setLocalParse] = useState<RO<AnalysisFull> | null>(null);

  const typification = localParse ? labelType(localParse.type) : labelType(activeCst.analysis.type);

  const attributions = activeCst.attributes.map(id => schema.cstByID.get(id)!);

  const isBasic = isBasicConcept(activeCst.cst_type);
  const isElementary = isBaseSet(activeCst.cst_type);
  const showConvention = !!activeCst.convention || forceComment || isBasic;

  const needsInterpretation = isBasic && !isLogical(activeCst.cst_type);

  useLayoutEffect(
    function resetGlobalModifiedFlagOnCstChange() {
      onModifiedEvent(false);
    },
    [activeCst.id]
  );

  useEffect(
    function resetFormOnCstChange() {
      onResetEvent(constituentaDefaults(activeCst));
    },
    [activeCst, toggleReset]
  );

  useEffect(
    function resetUIStateOnCstChange() {
      const timeoutId = setTimeout(function resetConstituentaUIState() {
        setForceComment(false);
        setLocalParse(null);
      }, 0);
      return () => clearTimeout(timeoutId);
    },
    [activeCst.id, toggleReset, schema]
  );

  useEffect(
    function syncGlobalModified() {
      onModifiedEvent(!isDefaultValue);
    },
    [isDefaultValue]
  );

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

  return (
    <form
      id={id}
      className='cc-column mt-1 gap-3 px-6 pb-3'
      onSubmit={withPreventDefault(() => void form.handleSubmit())}
    >
      <div className='flex items-center gap-2 mr-2 font-math font-semibold select-text'>
        <span>Конституента {activeCst.alias}</span>
      </div>
      <ConstituentaPrimaryActions className='-mt-1' activeCst={activeCst} schema={schema} />

      <form.Field name='item_data.term_raw'>
        {field => (
          <div className='relative'>
            {!disabled ? (
              <TextButton
                text='Изменить словоформы'
                className='z-pop text-sm absolute top-0 left-19'
                title={disabled ? undefined : isModified ? tooltipText.unsaved : 'Редактировать словоформы термина'}
                onClick={openTermEditor}
                disabled={isModified}
              />
            ) : null}

            <RefsInput
              id='cst_term'
              label='Термин'
              aria-label='Термин'
              maxHeight='8rem'
              areaClassName={
                (needsInterpretation && !field.state.value) || activeCst.homonyms.length > 0 ? 'cm-error' : ''
              }
              placeholder={disabled ? '' : 'Обозначение для текстовых определений'}
              schema={schema}
              onOpenEdit={onOpenEdit}
              value={field.state.value ?? ''}
              initialValue={activeCst.term_raw}
              resolved={activeCst.term_resolved}
              onChange={newValue => field.handleChange(newValue)}
              disabled={disabled}
              error={
                field.state.meta.errors[0]?.message ??
                (needsInterpretation && !field.state.value
                  ? 'Пустой термин'
                  : activeCst.homonyms.length > 0
                    ? `Термин совпадает с конституентами: ${formatAliasList(activeCst.homonyms, schema)}`
                    : undefined)
              }
            />
          </div>
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
        <TextArea
          id='cst_typification'
          label='Типизация'
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
              onCreateCst={createCstFromData}
              onUpdateCst={patchConstituenta}
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
              areaClassName={clsx(
                'disabled:min-h-9 max-h-32',
                needsInterpretation && !field.state.value && 'border-destructive! outline-destructive!'
              )}
              spellCheck
              label={isBasic ? 'Конвенция' : 'Комментарий'}
              placeholder={
                disabled ? '' : isBasic ? 'Договоренность об интерпретации базового понятия' : 'Пояснение разработчика'
              }
              disabled={disabled || (isBasic && activeCst.is_inherited)}
              value={field.state.value ?? ''}
              onChange={event => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              error={
                field.state.meta.errors[0]?.message ??
                (needsInterpretation && !field.state.value ? 'Пустая конвенция' : undefined)
              }
            />
          )}
        </form.Field>
      ) : null}

      {!showConvention && (!disabled || isProcessing) ? (
        <TextButton text='Добавить комментарий' onClick={() => setForceComment(true)} />
      ) : null}
    </form>
  );
}

function formatAliasList(items: readonly number[], schema: RSForm) {
  if (items.length === 0) {
    return '';
  }
  return items.map(item => schema.cstByID.get(item)!.alias).join(', ');
}
