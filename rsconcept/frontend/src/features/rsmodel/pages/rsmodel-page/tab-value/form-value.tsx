'use client';

import { useEffect, useEffectEvent, useLayoutEffect, useState } from 'react';

import { type BasicBinding, type Constituenta, CstType } from '@/domain/library';
import { isBaseSet } from '@/domain/library/rsform-api';
import { isInferrable, isInterpretable, prepareValueString } from '@/domain/library/rsmodel-api';
import { type CalculatorResult, TypeID, type Value } from '@/domain/rslang';
import { valueStub } from '@/domain/rslang/eval/value-api';
import { labelType } from '@/domain/rslang/labels';
import { formatLabel, lid, useTx } from '@/i18n';

import { useConceptNavigation, useRegisterNavigationSave } from '@/app';
import { HelpTopic } from '@/features/help';
import { type UpdateConstituentaDTO } from '@/features/rsform/backend/types';
import { EditorRSExpression } from '@/features/rsform/components/editor-rsexpression/editor-rsexpression';
import { RefsInput } from '@/features/rsform/components/refs-input';
import { labelRSExpression } from '@/features/rsform/labels';
import { useSchemaEdit } from '@/features/rsform/pages/rsform-page/schema-edit-context';

import { TextButton } from '@/components/control/text-button';
import { TextArea } from '@/components/input';
import { useModificationStore } from '@/stores/modification';
import { usePreferencesStore } from '@/stores/preferences';
import { type RO } from '@/utils/meta';
import { withPreventDefault } from '@/utils/utils';

import { ValueInput } from '../../../components/value-input';
import { useCstStatus } from '../../../hooks/use-cst-status';
import { useCstValue } from '../../../hooks/use-cst-value';
import { labelValue } from '../../../labels';
import { processBindingData, processValueData } from '../../../models/data-loading';
import { useModelEdit } from '../model-edit-context';

import { ValuePrimaryActions } from './value-primary-actions';

interface FormValueProps {
  id?: string;
  activeCst: Constituenta;
  onOpenEdit: (cstID: number) => void;
  toggleReset: boolean;
}

export function FormValue({ id, activeCst, onOpenEdit, toggleReset }: FormValueProps) {
  const tx = useTx();
  const router = useConceptNavigation();
  const { isMutable, engine, schema } = useModelEdit();
  const { patchConstituenta, createCstFromData, openTermEditor, isContentEditable, isProcessing } = useSchemaEdit();
  const typification = activeCst.analysis.type;

  const isModified = useModificationStore(state => state.isModified);
  const setIsModified = useModificationStore(state => state.setIsModified);
  const onModifiedEvent = useEffectEvent(setIsModified);
  const showDataText = usePreferencesStore(state => state.showDataText);
  const toggleDataText = usePreferencesStore(state => state.toggleShowDataText);

  const isBase = isBaseSet(activeCst.cst_type);
  const cstInferrable = isInferrable(activeCst.cst_type);
  const isValueEditable =
    !isMutable || cstInferrable || !isInterpretable(activeCst.cst_type) || (showDataText && !isBase);
  const status = useCstStatus(engine, activeCst);
  const [localEval, setLocalEval] = useState<RO<CalculatorResult> | null>(null);

  const cstData = useCstValue(engine, activeCst);
  const stub = cstData && typification?.typeID === TypeID.collection ? valueStub(cstData) : '';

  const initialValue = isBase ? (engine.basics.get(activeCst.id) ?? {}) : cstData;

  const initialStr =
    prepareValueString(initialValue, typification, schema, engine.basics, showDataText) ??
    formatLabel(lid.placeholder.valueTooLarge);
  const valueResetKey = `${activeCst.id}:${toggleReset ? '1' : '0'}`;
  const [valueDraft, setValueDraft] = useState(() => ({
    resetKey: valueResetKey,
    source: initialStr,
    draft: initialStr
  }));

  const [termDraft, setTermDraft] = useState(activeCst.term_raw);
  const [formalDraft, setFormalDraft] = useState(activeCst.definition_formal);
  const [rawDraft, setRawDraft] = useState(activeCst.definition_raw);

  const hasDraftForCurrentCst = valueDraft.resetKey === valueResetKey;
  const inputValue = hasDraftForCurrentCst ? valueDraft.draft : initialStr;
  const valueDirty = hasDraftForCurrentCst && valueDraft.draft !== valueDraft.source;
  const metaDirty =
    termDraft !== activeCst.term_raw ||
    formalDraft !== activeCst.definition_formal ||
    rawDraft !== activeCst.definition_raw;
  const isDirty = valueDirty || metaDirty;

  const metaFieldsDisabled = !isContentEditable || isProcessing;
  const formalFieldDisabled = metaFieldsDisabled || activeCst.is_inherited;

  useLayoutEffect(
    function resetGlobalModifiedFlagOnCstChange() {
      onModifiedEvent(false);
    },
    [activeCst.id]
  );

  useEffect(
    function syncSchemaFieldDraftsFromServer() {
      const timeoutId = setTimeout(function applyServerSchemaFields() {
        setTermDraft(activeCst.term_raw);
        setFormalDraft(activeCst.definition_formal);
        setRawDraft(activeCst.definition_raw);
      }, 0);
      return () => clearTimeout(timeoutId);
    },
    [activeCst.id, activeCst.term_raw, activeCst.definition_formal, activeCst.definition_raw, toggleReset]
  );

  useEffect(
    function syncGlobalModified() {
      onModifiedEvent(isDirty);
    },
    [isDirty]
  );

  useEffect(
    function syncValueDraftFromServer() {
      const timeoutId = setTimeout(function applyServerValueDraft() {
        setValueDraft(prevDraft => {
          if (prevDraft.resetKey !== valueResetKey) {
            return {
              resetKey: valueResetKey,
              source: initialStr,
              draft: initialStr
            };
          }
          if (prevDraft.source === initialStr) {
            return prevDraft;
          }
          const hasUnsavedChanges = prevDraft.draft !== prevDraft.source;
          if (hasUnsavedChanges) {
            return prevDraft;
          }
          return {
            resetKey: valueResetKey,
            source: initialStr,
            draft: initialStr
          };
        });
      }, 0);
      return () => clearTimeout(timeoutId);
    },
    [valueResetKey, initialStr]
  );

  function handleSetValue(newValue: Value | BasicBinding | null) {
    if (newValue === null) {
      void engine.resetValue(activeCst.id);
    }
    const valueStr =
      prepareValueString(newValue, typification, schema, engine.basics, showDataText) ??
      formatLabel(lid.placeholder.valueTooLarge);
    if (isBase) {
      void engine.setBasicValue(activeCst.id, newValue as BasicBinding);
    } else {
      void engine.setStructureValue(activeCst.id, newValue as Value);
    }
    setValueDraft({
      resetKey: valueResetKey,
      source: valueStr,
      draft: valueStr
    });
  }

  function onSaveValue() {
    if (!inputValue) {
      return;
    }
    const processed = isBase ? processBindingData(inputValue) : processValueData(inputValue);
    if (processed) {
      handleSetValue(processed);
    }
  }

  async function onSaveMetaFields() {
    if (!metaDirty) {
      return;
    }
    const item_data: UpdateConstituentaDTO['item_data'] = {};
    if (termDraft !== activeCst.term_raw) {
      item_data.term_raw = termDraft;
    }
    if (formalDraft !== activeCst.definition_formal) {
      item_data.definition_formal = formalDraft;
    }
    if (rawDraft !== activeCst.definition_raw) {
      item_data.definition_raw = rawDraft;
    }
    if (Object.keys(item_data).length === 0) {
      return;
    }
    const dto: UpdateConstituentaDTO = { target: activeCst.id, item_data };
    await patchConstituenta(dto);
  }

  async function handleSubmitAll() {
    if (metaDirty && isContentEditable) {
      await onSaveMetaFields();
    }
    if (valueDirty && isMutable) {
      onSaveValue();
    }
  }

  useRegisterNavigationSave(handleSubmitAll, isDirty);

  function handleCalculate(event: React.MouseEvent<Element>) {
    event.preventDefault();
    event.stopPropagation();
    void onSaveMetaFields();
    const result = engine.calculateCst(activeCst.id);
    setLocalEval(result);
  }

  function handleNavigateCst(cstID: number) {
    void router.changeActive(cstID);
  }

  function handleInput(event: React.KeyboardEvent<HTMLFormElement>) {
    if ((event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
      event.preventDefault();
      event.stopPropagation();
      if (isModified) {
        void handleSubmitAll();
      }
      return;
    }
  }

  return (
    <form
      id={id}
      className='relative mt-1 cc-column gap-3 px-6 pb-3'
      tabIndex={-1}
      onKeyDown={handleInput}
      onSubmit={withPreventDefault(() => void handleSubmitAll())}
    >
      <div className='flex items-center gap-2 mr-2 font-math font-semibold select-text'>
        <span>{tx('ui.rsform.heading.constituenta', { alias: activeCst.alias })}</span>
      </div>

      <ValuePrimaryActions activeCst={activeCst} cstData={cstData} onChangeValue={handleSetValue} />

      <TextArea
        fitContent
        dense
        noResize
        noBorder
        noOutline
        transparent
        readOnly
        label={tx('ui.label.typification')}
        value={labelType(typification)}
        areaClassName='cursor-default'
      />

      {cstInferrable || (activeCst.definition_formal && activeCst.cst_type !== CstType.STRUCTURED) ? (
        <EditorRSExpression
          label={labelRSExpression(activeCst.cst_type)}
          placeholder={tx('ui.placeholder.expressionMissing')}
          value={formalDraft}
          schema={schema}
          activeCst={activeCst}
          expressionType={activeCst.analysis.type}
          errors={localEval?.errors ?? null}
          helpTopic={HelpTopic.UI_EVAL_STATUS}
          isProcessing={isProcessing}
          extractionDisabled={formalFieldDisabled || !isContentEditable}
          onCreateCst={isContentEditable ? createCstFromData : undefined}
          onUpdateCst={isContentEditable ? patchConstituenta : undefined}
          onChange={setFormalDraft}
          disabled={formalFieldDisabled}
          onOpenEdit={handleNavigateCst}
        />
      ) : null}

      <ValueInput
        areaClassname='max-h-60 min-h-10'
        rows={8}
        value={inputValue}
        stub={valueDirty ? '' : stub}
        valueLabel={labelValue(localEval ? localEval.value : cstData, typification)}
        status={status}
        showDataText={showDataText}
        isBinding={isBase}
        placeholder={
          !isInterpretable(activeCst.cst_type)
            ? tx('ui.value.unsupportedType')
            : !isInferrable(activeCst.cst_type)
              ? tx('ui.value.missingHint')
              : undefined
        }
        onCalculate={cstInferrable ? handleCalculate : undefined}
        onChange={newValue =>
          setValueDraft(prevDraft => ({
            resetKey: valueResetKey,
            source: prevDraft.resetKey === valueResetKey ? prevDraft.source : initialStr,
            draft: newValue
          }))
        }
        onToggleDataText={toggleDataText}
        disabled={isValueEditable}
      />

      <div className='relative'>
        {!metaFieldsDisabled ? (
          <TextButton
            text={tx('ui.rsform.action.editWordForms')}
            className='z-pop text-sm absolute top-0 left-19'
            title={isModified ? formatLabel(lid.tooltip.unsaved) : tx('ui.rsform.hint.editTermWordForms')}
            onClick={openTermEditor}
            disabled={isModified}
          />
        ) : null}
        <RefsInput
          id='cst_term'
          label={tx('ui.label.term')}
          placeholder={tx('ui.placeholder.termMissing')}
          schema={schema}
          onOpenEdit={onOpenEdit}
          value={termDraft}
          initialValue={activeCst.term_raw}
          resolved={activeCst.term_resolved}
          onChange={setTermDraft}
          disabled={metaFieldsDisabled}
        />
      </div>

      <RefsInput
        id='cst_definition'
        label={tx('ui.label.textDefinition')}
        placeholder={
          formalFieldDisabled ? tx('ui.placeholder.definitionMissing') : tx('ui.placeholder.textDefinitionHint')
        }
        maxHeight='6rem'
        schema={schema}
        onOpenEdit={onOpenEdit}
        value={rawDraft}
        initialValue={activeCst.definition_raw}
        resolved={activeCst.definition_resolved}
        onChange={setRawDraft}
        disabled={formalFieldDisabled}
      />
    </form>
  );
}
