'use client';

import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { type ReactCodeMirrorRef } from '@uiw/react-codemirror';

import { type BasicBinding, type Constituenta, CstType } from '@/domain/library';
import { isBaseSet } from '@/domain/library/rsform-api';
import { isInferrable, isInterpretable, prepareValueString } from '@/domain/library/rsmodel-api';
import { type CalculatorResult, type RSErrorDescription, TokenID, TypeID, type Value } from '@/domain/rslang';
import { normalizeValue, valueStub } from '@/domain/rslang/eval/value-api';
import { labelType } from '@/domain/rslang/labels';

import { useConceptNavigation } from '@/app';
import { type UpdateConstituentaDTO } from '@/features/rsform/backend/types';
import { RSEditorControls } from '@/features/rsform/components/editor-rsexpression/rs-edit-controls';
import { RefsInput } from '@/features/rsform/components/refs-input';
import { RSInput } from '@/features/rsform/components/rs-input';
import { RSTextWrapper } from '@/features/rsform/components/rs-input/text-editing';
import { ViewErrors } from '@/features/rsform/components/view-errors';
import { labelRSExpression } from '@/features/rsform/labels';
import { useSchemaEdit } from '@/features/rsform/pages/rsform-page/schema-edit-context';

import { TextButton } from '@/components/control/text-button';
import { TextArea } from '@/components/input';
import { useModificationStore } from '@/stores/modification';
import { usePreferencesStore } from '@/stores/preferences';
import { placeholderMsg, tooltipText } from '@/utils/labels';
import { type RO } from '@/utils/meta';
import { withPreventDefault } from '@/utils/utils';

import { ValueInput } from '../../../components/value-input';
import { useCstStatus } from '../../../hooks/use-cst-status';
import { useCstValue } from '../../../hooks/use-cst-value';
import { labelValue } from '../../../labels';
import { useModelEdit } from '../model-edit-context';

import { ToolbarExpression } from './toolbar-expression';
import { ValuePrimaryActions } from './value-primary-actions';

interface FormValueProps {
  id?: string;
  activeCst: Constituenta;
  onOpenEdit: (cstID: number) => void;
  toggleReset: boolean;
}

export function FormValue({ id, activeCst, onOpenEdit, toggleReset }: FormValueProps) {
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
    prepareValueString(initialValue, typification, schema, engine.basics, showDataText) ?? placeholderMsg.valueTooLarge;
  const valueResetKey = `${activeCst.id}:${toggleReset ? '1' : '0'}`;
  const [valueDraft, setValueDraft] = useState(() => ({
    resetKey: valueResetKey,
    source: initialStr,
    draft: initialStr
  }));

  const [termDraft, setTermDraft] = useState(activeCst.term_raw);
  const [formalDraft, setFormalDraft] = useState(activeCst.definition_formal);
  const [rawDraft, setRawDraft] = useState(activeCst.definition_raw);

  const hasFreshValueDraft = valueDraft.resetKey === valueResetKey && valueDraft.source === initialStr;
  const inputValue = hasFreshValueDraft ? valueDraft.draft : initialStr;
  const valueDirty = hasFreshValueDraft && valueDraft.draft !== initialStr;
  const metaDirty =
    termDraft !== activeCst.term_raw ||
    formalDraft !== activeCst.definition_formal ||
    rawDraft !== activeCst.definition_raw;
  const isDirty = valueDirty || metaDirty;

  const metaFieldsDisabled = !isContentEditable || isProcessing;
  const formalFieldDisabled = metaFieldsDisabled || activeCst.is_inherited;

  const rsInput = useRef<ReactCodeMirrorRef>(null);

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

  function handleSetValue(newValue: Value | BasicBinding | null) {
    if (newValue === null) {
      void engine.resetValue(activeCst.id);
    } else if (isBase) {
      const binding = newValue as BasicBinding;
      void engine.setBasicValue(activeCst.id, binding);
      const value =
        prepareValueString(binding, typification, schema, engine.basics, showDataText) ?? placeholderMsg.valueTooLarge;
      setValueDraft({
        resetKey: valueResetKey,
        source: value,
        draft: value
      });
    } else {
      const parsedValue = newValue as Value;
      normalizeValue(parsedValue);
      void engine.setStructureValue(activeCst.id, parsedValue);
      const value =
        prepareValueString(parsedValue, typification, schema, engine.basics, showDataText) ??
        placeholderMsg.valueTooLarge;
      setValueDraft({
        resetKey: valueResetKey,
        source: value,
        draft: value
      });
    }
  }

  function onSaveValue() {
    if (!inputValue) {
      return;
    }
    try {
      const value = JSON.parse(inputValue) as Value | BasicBinding;
      handleSetValue(value);
    } catch (error) {
      toast.error((error as Error).message);
      console.error(error);
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

  function handleEditFormal(id: TokenID, key?: string) {
    if (!rsInput.current?.editor || !rsInput.current.state || !rsInput.current.view) {
      return;
    }
    const text = new RSTextWrapper(rsInput.current as Required<ReactCodeMirrorRef>);
    if (id === TokenID.ID_LOCAL) {
      text.replaceWith(key ?? 'unknown_local');
    } else {
      text.insertToken(id);
    }
    rsInput.current?.view?.focus();
  }

  function handleShowError(error: RO<RSErrorDescription>) {
    if (!rsInput.current) {
      return;
    }
    rsInput.current.view?.dispatch({
      selection: {
        anchor: error.from,
        head: error.to
      }
    });
    rsInput.current.view?.focus();
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
        <span>Конституента {activeCst.alias}</span>
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
        label='Типизация'
        value={labelType(typification)}
        areaClassName='cursor-default'
      />

      {cstInferrable || (activeCst.definition_formal && activeCst.cst_type !== CstType.STRUCTURED) ? (
        <div className='relative'>
          <ToolbarExpression
            className='absolute -top-1 right-0'
            expression={formalDraft}
            type={activeCst.analysis.type}
            activeCstId={activeCst.id}
            extractionDisabled={formalFieldDisabled || !isContentEditable}
            onCreateCst={isContentEditable ? createCstFromData : undefined}
            onUpdateCst={isContentEditable ? patchConstituenta : undefined}
          />
          <RSInput
            ref={rsInput}
            label={labelRSExpression(activeCst.cst_type)}
            placeholder='Выражение отсутствует'
            schema={schema}
            value={formalDraft}
            onChange={setFormalDraft}
            disabled={formalFieldDisabled}
            onOpenEdit={handleNavigateCst}
          />
          <RSEditorControls
            isOpen={isContentEditable && (isProcessing || !activeCst.is_inherited)}
            onEdit={handleEditFormal}
          />
        </div>
      ) : null}

      <ValueInput
        areaClassname='max-h-60'
        rows={8}
        value={inputValue}
        stub={valueDirty ? '' : stub}
        valueLabel={labelValue(localEval ? localEval.value : cstData, typification)}
        status={status}
        showDataText={showDataText}
        isBinding={isBase}
        placeholder={
          !isInterpretable(activeCst.cst_type) ? 'Значение для данного типа не предусмотрено' : 'Значение отсутствует'
        }
        onCalculate={cstInferrable ? handleCalculate : undefined}
        onChange={newValue =>
          setValueDraft({
            resetKey: valueResetKey,
            source: initialStr,
            draft: newValue
          })
        }
        onToggleDataText={toggleDataText}
        disabled={isValueEditable}
      />

      <div className='-mt-3'>
        <ViewErrors
          isOpen={!!localEval && localEval.errors.length > 0}
          errors={localEval?.errors ?? null}
          onShowError={handleShowError}
        />
      </div>

      <div className='relative'>
        {!metaFieldsDisabled ? (
          <TextButton
            text='Изменить словоформы'
            className='z-pop text-sm absolute top-0 left-19'
            title={isModified ? tooltipText.unsaved : 'Редактировать словоформы термина'}
            onClick={openTermEditor}
            disabled={isModified}
          />
        ) : null}
        <RefsInput
          id='cst_term'
          label='Термин'
          placeholder='Термин отсутствует'
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
        label='Текстовое определение'
        placeholder={formalFieldDisabled ? 'Определение отсутствует' : 'Текстовая интерпретация формального выражения'}
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
