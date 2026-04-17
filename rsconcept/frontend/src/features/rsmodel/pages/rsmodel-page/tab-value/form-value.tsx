'use client';

import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { type ReactCodeMirrorRef } from '@uiw/react-codemirror';

import { type BasicBinding, type Constituenta, CstType } from '@/domain/library';
import { getStructureName, isBaseSet } from '@/domain/library/rsform-api';
import { isInferrable, isInterpretable, prepareValueString } from '@/domain/library/rsmodel-api';
import { type CalculatorResult, TokenID, type Value } from '@/domain/rslang';
import { normalizeValue, valueStub } from '@/domain/rslang/eval/value-api';
import { labelType } from '@/domain/rslang/labels';
import { isTypification, type TypePath, type Typification } from '@/domain/rslang/semantic/typification';

import { useConceptNavigation } from '@/app';
import { type UpdateConstituentaDTO } from '@/features/rsform/backend/types';
import { RSEditorControls } from '@/features/rsform/components/editor-rsexpression/rs-edit-controls';
import { RefsInput } from '@/features/rsform/components/refs-input';
import { RSInput } from '@/features/rsform/components/rs-input';
import { RSTextWrapper } from '@/features/rsform/components/rs-input/text-editing';
import { ViewErrors } from '@/features/rsform/components/view-errors';
import { labelRSExpression } from '@/features/rsform/labels';
import { useRSFormEdit } from '@/features/rsform/pages/rsform-page/rsedit-context';

import { Button } from '@/components/control';
import { IconSave } from '@/components/icons';
import { TextArea } from '@/components/input';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { usePreferencesStore } from '@/stores/preferences';
import { errorMsg } from '@/utils/labels';
import { type RO } from '@/utils/meta';

import { ValueInput } from '../../../components/value-input';
import { useCstStatus } from '../../../hooks/use-cst-status';
import { useCstValue } from '../../../hooks/use-cst-value';
import { labelValue } from '../../../labels';
import { useRSModelEdit } from '../rsmodel-context';

import { ToolbarExpression } from './toolbar-expression';

interface FormValueProps {
  id?: string;
  activeCst: Constituenta;
  onOpenEdit: (cstID: number) => void;
}

export function FormValue({ id, activeCst, onOpenEdit }: FormValueProps) {
  const router = useConceptNavigation();
  const { isMutable, engine, schema } = useRSModelEdit();
  const { patchConstituenta, isContentEditable, isProcessing } = useRSFormEdit();
  const typification = activeCst.analysis.type;

  const isModified = useModificationStore(state => state.isModified);
  const setIsModified = useModificationStore(state => state.setIsModified);
  const onModifiedEvent = useEffectEvent(setIsModified);
  const showDataText = usePreferencesStore(state => state.showDataText);
  const showEditValue = useDialogsStore(state => state.showModelEditValue);
  const showViewValue = useDialogsStore(state => state.showModelViewValue);
  const showEditBinding = useDialogsStore(state => state.showModelEditBinding);

  const isBase = isBaseSet(activeCst.cst_type);
  const cstInferrable = isInferrable(activeCst.cst_type);
  const status = useCstStatus(engine, activeCst);
  const [localEval, setLocalEval] = useState<RO<CalculatorResult> | null>(null);

  const cstData = useCstValue(engine, activeCst);
  const stub = valueStub(cstData);

  const initialValue = isBase ? (engine.basics.get(activeCst.id) ?? ({} as BasicBinding)) : cstData;

  const initialStr = prepareValueString(initialValue, typification, schema, engine.basics, showDataText);
  const [inputValue, setInputValue] = useState<string>(initialStr);
  const hasValueDialog = !!typification && isTypification(typification) && (cstData != null || !cstInferrable);

  const [termDraft, setTermDraft] = useState(activeCst.term_raw);
  const [formalDraft, setFormalDraft] = useState(activeCst.definition_formal);
  const [rawDraft, setRawDraft] = useState(activeCst.definition_raw);

  const valueDirty = inputValue !== initialStr;
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
    function resetUIStateOnCstChange() {
      const timeoutId = setTimeout(function resetValueEditorState() {
        setInputValue(initialStr);
        onModifiedEvent(false);
      }, 0);
      return () => clearTimeout(timeoutId);
    },
    [activeCst.id, initialStr]
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
    [activeCst.id, activeCst.term_raw, activeCst.definition_formal, activeCst.definition_raw]
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
      const value = prepareValueString(binding, typification, schema, engine.basics, showDataText);
      setInputValue(value);
    } else {
      const parsedValue = newValue as Value;
      normalizeValue(parsedValue);
      void engine.setStructureValue(activeCst.id, parsedValue);
      const value = prepareValueString(parsedValue, typification, schema, engine.basics, showDataText);
      setInputValue(value);
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

  function handleValueDialog() {
    if (isBase) {
      showEditBinding({
        initialValue: engine.basics.get(activeCst.id) ?? {},
        onChange: isMutable ? handleSetValue : undefined
      });
      return;
    }
    const type = activeCst.analysis.type as Typification;
    const getHeaderText = (path: TypePath) => getStructureName(schema, activeCst, path);
    if (!cstInferrable && isMutable) {
      showEditValue({
        initialValue: cstData,
        type: type,
        engine: engine,
        onChange: handleSetValue,
        getHeaderText: getHeaderText
      });
    } else if (!cstData) {
      toast.error(errorMsg.valueNull);
    } else {
      showViewValue({
        value: cstData,
        type: type,
        engine: engine,
        getHeaderText: getHeaderText
      });
    }
  }

  function handleInput(event: React.KeyboardEvent<HTMLDivElement>) {
    if ((event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
      event.preventDefault();
      event.stopPropagation();
      if (isModified) {
        if (metaDirty && isContentEditable) {
          void onSaveMetaFields();
        }
        if (valueDirty && isMutable) {
          onSaveValue();
        }
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

  return (
    <div id={id} className='relative mt-1 cc-column px-6 pb-1 pt-8' tabIndex={-1} onKeyDown={handleInput}>
      <div className='flex items-center gap-3'>
        <div className='font-math -mt-0.5 font-medium whitespace-nowrap select-text cursor-default'>
          {activeCst?.alias ?? ''}
        </div>
        <RefsInput
          id='cst_term'
          aria-label='Термин'
          placeholder='Термин отсутствует'
          className='grow'
          schema={schema}
          onOpenEdit={onOpenEdit}
          value={termDraft}
          initialValue={activeCst.term_raw}
          resolved={activeCst.term_resolved}
          onChange={setTermDraft}
          disabled={metaFieldsDisabled}
        />
      </div>
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

      <ValueInput
        className='max-h-60'
        rows={8}
        initialStr={initialStr}
        value={inputValue}
        stub={isDirty ? '' : stub}
        valueLabel={labelValue(localEval ? localEval.value : cstData, typification)}
        status={status}
        placeholder={
          !isInterpretable(activeCst.cst_type) ? 'Значение для данного типа не предусмотрено' : 'Значение отсутствует'
        }
        onCalculate={cstInferrable ? handleCalculate : undefined}
        onChangeStr={setInputValue}
        onValueDialog={hasValueDialog ? handleValueDialog : undefined}
        onSubmit={onSaveValue}
        disabled={!isMutable || cstInferrable || !isInterpretable(activeCst.cst_type) || (showDataText && !isBase)}
      />

      {cstInferrable || (activeCst.definition_formal && activeCst.cst_type !== CstType.STRUCTURED) ? (
        <div className='relative -mb-2'>
          <ToolbarExpression
            className='absolute -top-1 right-0'
            expression={activeCst.definition_formal}
            type={activeCst.analysis.type}
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

      <ViewErrors isOpen={!!localEval && localEval.errors.length > 0} errors={localEval?.errors ?? null} />

      <RefsInput
        id='cst_definition'
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

      <Button
        colorSubmit
        className='mx-auto'
        text='Сохранить изменения'
        icon={<IconSave size='1.25rem' />}
        disabled={metaFieldsDisabled || !isModified}
        onClick={() => void onSaveMetaFields()}
      />
    </div>
  );
}
