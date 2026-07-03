'use client';

import { useEffect, useEffectEvent, useLayoutEffect, useState } from 'react';
import clsx from 'clsx';

import { useTx } from '@/i18n';
import { type BasicBinding, type Constituenta, CstType } from '@rsconcept/domain/library';
import {
  canHaveManualTypification,
  isBaseSet,
  isBasicConcept,
  isFunctional,
  isLogical
} from '@rsconcept/domain/library/rsform-api';
import { isInferrable, isInterpretable } from '@rsconcept/domain/library/rsmodel-api';
import { type CalculatorResult, TypeID, type Value } from '@rsconcept/domain/rslang';
import { valueStub } from '@rsconcept/domain/rslang/eval/value-api';
import { labelType } from '@rsconcept/domain/rslang/labels';

import { useConceptNavigation, useRegisterUnsavedSave } from '@/app';
import { HelpTopic } from '@/features/help';
import { type UpdateConstituentaDTO } from '@/features/rsform';
import { EditorRSExpression } from '@/features/rsform/components/editor-rsexpression/editor-rsexpression';
import { RefsInput } from '@/features/rsform/components/refs-input';
import { TypificationInput } from '@/features/rsform/components/typification-input';
import { labelRSExpression } from '@/features/rsform/labels';
import { useSchemaEdit } from '@/features/rsform/pages/rsform-page/schema-edit-context';

import { TextButton } from '@/components/control/text-button';
import { TextArea } from '@/components/input';
import { useModificationStore } from '@/stores/modification';
import { usePreferencesStore } from '@/stores/preferences';
import { withPreventDefault } from '@/utils/utils';

import { ValueInput } from '../../../components/value-input';
import { useCstStatus } from '../../../hooks/use-cst-status';
import { useCstValue } from '../../../hooks/use-cst-value';
import { labelValue, prepareValueString } from '../../../labels';
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
  const typification = activeCst.effectiveType;

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
  const [localEval, setLocalEval] = useState<CalculatorResult | null>(null);

  const cstData = useCstValue(engine, activeCst);
  const stub = cstData && typification?.typeID === TypeID.collection ? valueStub(cstData) : '';

  const initialValue = isBase ? (engine.basics.get(activeCst.id) ?? {}) : cstData;

  const initialStr =
    prepareValueString(initialValue, typification, schema, engine.basics, showDataText) ??
    tx('tx.rslang.value.render.tooLarge.hint');
  const valueResetKey = `${activeCst.id}:${toggleReset ? '1' : '0'}`;
  const [valueDraft, setValueDraft] = useState(() => ({
    resetKey: valueResetKey,
    source: initialStr,
    draft: initialStr
  }));

  const [termDraft, setTermDraft] = useState(activeCst.term_raw);
  const [formalDraft, setFormalDraft] = useState(activeCst.definition_formal);
  const [rawDraft, setRawDraft] = useState(activeCst.definition_raw);
  const [manualTypificationDraft, setManualTypificationDraft] = useState(activeCst.typification_manual);
  const [forceManualType, setForceManualType] = useState(!!activeCst.typification_manual);
  const [conventionDraft, setConventionDraft] = useState(activeCst.convention);
  const [forceComment, setForceComment] = useState(false);

  const canManualType = canHaveManualTypification(activeCst.cst_type);
  const showManualType =
    !!manualTypificationDraft || !!activeCst.typification_manual || (canManualType && forceManualType);

  const isBasic = isBasicConcept(activeCst.cst_type);
  const showConvention = !!activeCst.convention || forceComment || isBasic;
  const needsInterpretation = isBasic && !isLogical(activeCst.cst_type);

  const hasDraftForCurrentCst = valueDraft.resetKey === valueResetKey;
  const inputValue = hasDraftForCurrentCst ? valueDraft.draft : initialStr;
  const valueDirty = hasDraftForCurrentCst && valueDraft.draft !== valueDraft.source;
  const metaDirty =
    termDraft !== activeCst.term_raw ||
    formalDraft !== activeCst.definition_formal ||
    rawDraft !== activeCst.definition_raw ||
    manualTypificationDraft !== activeCst.typification_manual ||
    conventionDraft !== activeCst.convention;
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
        setManualTypificationDraft(activeCst.typification_manual);
        setForceManualType(!!activeCst.typification_manual);
        setConventionDraft(activeCst.convention);
        setForceComment(false);
      }, 0);
      return () => clearTimeout(timeoutId);
    },
    [
      activeCst.id,
      activeCst.term_raw,
      activeCst.definition_formal,
      activeCst.definition_raw,
      activeCst.typification_manual,
      activeCst.convention,
      toggleReset
    ]
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
      tx('tx.rslang.value.render.tooLarge.hint');
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
    if (manualTypificationDraft !== activeCst.typification_manual) {
      item_data.typification_manual = manualTypificationDraft;
    }
    if (conventionDraft !== activeCst.convention) {
      item_data.convention = conventionDraft;
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

  useRegisterUnsavedSave(handleSubmitAll, isDirty);

  function handleCalculate(event: React.MouseEvent<Element>) {
    event.preventDefault();
    event.stopPropagation();
    void onSaveMetaFields().then(() => {
      const result = engine.calculateCst(activeCst.id);
      setLocalEval(result);
    });
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
      <h2 className='text-left w-fit'>{tx('tx.cst') + ' ' + activeCst.alias}</h2>
      <ValuePrimaryActions activeCst={activeCst} cstData={cstData} onChangeValue={handleSetValue} />

      {showManualType ? (
        <TypificationInput
          label={tx('tx.rslang.typification.manual')}
          placeholder={metaFieldsDisabled ? '' : tx('tx.rslang.typification.manual.hint')}
          value={manualTypificationDraft}
          disabled={metaFieldsDisabled || activeCst.is_inherited}
          onChange={setManualTypificationDraft}
          areaClassName={activeCst.is_type_mismatch ? 'cm-error' : undefined}
          error={activeCst.is_type_mismatch ? tx('tx.rslang.typification.manual.validate') : undefined}
        />
      ) : null}

      <TextArea
        fitContent
        dense
        noResize
        noBorder
        noOutline
        transparent
        readOnly
        label={tx('tx.rslang.typification')}
        value={labelType(typification)}
        areaClassName='cursor-default'
      />

      {cstInferrable ||
      isFunctional(activeCst.cst_type) ||
      (activeCst.definition_formal && activeCst.cst_type !== CstType.STRUCTURED) ? (
        <EditorRSExpression
          label={labelRSExpression(activeCst.cst_type)}
          placeholder={tx('tx.lib.defineFormal.validate.empty')}
          value={formalDraft}
          schema={schema}
          activeCst={activeCst}
          expressionType={activeCst.effectiveType}
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
            ? tx('tx.rslang.value.type.error.hint')
            : !isInferrable(activeCst.cst_type)
              ? tx('tx.rslang.value.none.hint')
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
            text={tx('tx.lang.wordform.plural.editing')}
            className='z-pop text-sm absolute top-0 left-19'
            title={isModified ? tx('tx.general.changes.unsaved.hint') : tx('tx.lang.wordform.plural.editing.hint')}
            onClick={() => openTermEditor(() => handleSubmitAll())}
          />
        ) : null}
        <RefsInput
          id='cst_term'
          label={tx('tx.lang.term')}
          placeholder={tx('tx.lang.term.validate.empty')}
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
        label={tx('tx.lib.defineText')}
        placeholder={formalFieldDisabled ? tx('tx.lib.defineText.validate.empty') : tx('tx.lib.defineText.hint')}
        maxHeight='6rem'
        schema={schema}
        onOpenEdit={onOpenEdit}
        value={rawDraft}
        initialValue={activeCst.definition_raw}
        resolved={activeCst.definition_resolved}
        onChange={setRawDraft}
        disabled={formalFieldDisabled}
      />

      {showConvention ? (
        <TextArea
          id='cst_convention'
          fitContent
          areaClassName={clsx(
            'disabled:min-h-9 max-h-32',
            needsInterpretation && !conventionDraft && 'border-destructive! outline-destructive!'
          )}
          spellCheck
          label={isBasic ? tx('tx.lib.convention') : tx('tx.lib.comment')}
          placeholder={metaFieldsDisabled ? '' : isBasic ? tx('tx.lib.convention.hint') : tx('tx.lib.comment.hint')}
          disabled={metaFieldsDisabled || (isBasic && activeCst.is_inherited)}
          value={conventionDraft}
          onChange={event => setConventionDraft(event.target.value)}
          error={needsInterpretation && !conventionDraft ? tx('tx.lib.convention.validate.empty') : undefined}
        />
      ) : null}

      {!showConvention && (isContentEditable || isProcessing) ? (
        <TextButton text={tx('tx.lib.comment.add')} className='self-start' onClick={() => setForceComment(true)} />
      ) : null}
    </form>
  );
}
