'use client';

import { useEffect, useEffectEvent, useLayoutEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { useConceptNavigation } from '@/app';
import { type Constituenta, CstType } from '@/features/rsform';
import { RSInput } from '@/features/rsform/components/rs-input';
import { ViewErrors } from '@/features/rsform/components/view-errors';
import { labelRSExpression } from '@/features/rsform/labels';
import { getStructureName, isBaseSet } from '@/features/rsform/models/rsform-api';
import { type CalculatorResult, type Value } from '@/features/rslang';
import { normalizeValue, valueStub } from '@/features/rslang/eval/value-api';
import { labelType } from '@/features/rslang/labels';
import { isTypification, type TypePath, type Typification } from '@/features/rslang/semantic/typification';

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
import { type BasicBinding } from '../../../models/rsmodel';
import { isInferrable, isInterpretable, prepareValueString } from '../../../models/rsmodel-api';
import { useRSModelEdit } from '../rsmodel-context';

import { ToolbarExpression } from './toolbar-expression';

interface FormValueProps {
  id?: string;
  activeCst: Constituenta;
}

export function FormValue({ id, activeCst }: FormValueProps) {
  const router = useConceptNavigation();
  const { isMutable, engine, schema } = useRSModelEdit();
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

  const initialValue = isBase ? engine.basics.get(activeCst.id) ?? ({} as BasicBinding) : cstData;

  const initialStr = prepareValueString(initialValue, typification, schema, engine.basics, showDataText);
  const [inputValue, setInputValue] = useState<string>(initialStr);
  const hasValueDialog = !!typification && isTypification(typification) && (cstData != null || !cstInferrable);

  const isDirty = inputValue !== initialStr;

  useLayoutEffect(function resetGlobalModifiedFlagOnCstChange() {
    onModifiedEvent(false);
  }, [activeCst.id]);

  useEffect(function resetUIStateOnCstChange() {
    const timeoutId = setTimeout(function resetValueEditorState() {
      setInputValue(initialStr);
      onModifiedEvent(false);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [activeCst.id, initialStr]);

  useEffect(function syncGlobalModified() {
    onModifiedEvent(isDirty);
  }, [isDirty]);

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
    setIsModified(false);
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

  function handleCalculate(event: React.MouseEvent<Element>) {
    event.preventDefault();
    event.stopPropagation();
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
      if (isModified && isMutable) {
        onSaveValue();
      }
      return;
    }
  }

  return (
    <div id={id} className='relative mt-1 cc-column px-6 pb-1 pt-8' tabIndex={-1} onKeyDown={handleInput}>
      <div className='flex items-start'>
        <div className='font-math -mt-0.5 font-medium whitespace-nowrap select-text cursor-default'>
          {activeCst?.alias ?? ''}
        </div>
        <TextArea
          aria-label='Термин'
          placeholder='Термин отсутствует'
          value={activeCst.term_resolved}
          disabled
          readOnly
          noBorder
          fitContent
          noResize
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
      {cstInferrable || (activeCst.definition_formal && activeCst.cst_type !== CstType.STRUCTURED) ? (
        <div className='relative'>
          <ToolbarExpression
            className='absolute -top-1 right-0'
            expression={activeCst.definition_formal}
            type={activeCst.analysis.type}
          />
          <RSInput
            label={labelRSExpression(activeCst.cst_type)}
            placeholder='Выражение отсутствует'
            schema={schema}
            value={activeCst.definition_formal}
            disabled
            onOpenEdit={handleNavigateCst}
          />
        </div>
      ) : null}
      <ViewErrors
        className='-mt-3'
        isOpen={!!localEval && localEval.errors.length > 0}
        errors={localEval?.errors ?? null}
      />

      <ValueInput
        className='max-h-120'
        rows={10}
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
    </div>
  );
}
