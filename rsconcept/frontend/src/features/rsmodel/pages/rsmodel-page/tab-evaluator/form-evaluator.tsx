'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

import { CstType } from '@/domain/library';
import { getStructureName } from '@/domain/library/rsform-api';
import { inferEvalStatus, prepareValueString } from '@/domain/library/rsmodel-api';
import { type AnalysisFull, type CalculatorResult } from '@/domain/rslang';
import { valueStub } from '@/domain/rslang/eval/value-api';
import { labelType } from '@/domain/rslang/labels';
import { isTypification, TypeID, type TypePath, type Typification } from '@/domain/rslang/semantic/typification';
import { useTx } from '@/i18n';

import { useConceptNavigation } from '@/app';
import { HelpTopic } from '@/features/help';
import { EditorRSExpression } from '@/features/rsform/components/editor-rsexpression/editor-rsexpression';
import { useSchemaEdit } from '@/features/rsform/pages/rsform-page/schema-edit-context';

import { TextButton } from '@/components/control/text-button';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { TextArea } from '@/components/input';
import { cn } from '@/components/utils';
import { useDialogsStore } from '@/stores/dialogs';
import { usePreferencesStore } from '@/stores/preferences';
import { formatInteger } from '@/utils/format';
import { type RO } from '@/utils/meta';

import { ValueInput } from '../../../components/value-input';
import { labelValue } from '../../../labels';
import { copyJsonToClipboard, downloadJsonFile, getExportJsonText } from '../export-helpers';
import { useModelEdit } from '../model-edit-context';

const VALUE_FILENAME = 'eval_value.json';

interface FormEvaluatorProps {
  id?: string;
  className?: string;
}

export function FormEvaluator({ id, className }: FormEvaluatorProps) {
  const tx = useTx();
  const router = useConceptNavigation();
  const { schema, activeCst } = useSchemaEdit();
  const { engine } = useModelEdit();

  const showDataText = usePreferencesStore(state => state.showDataText);
  const toggleShowDataText = usePreferencesStore(state => state.toggleShowDataText);
  const disableCache = usePreferencesStore(state => state.disableCache);
  const showViewValue = useDialogsStore(state => state.showModelViewValue);

  const [evaluatedExpression, setEvaluatedExpression] = useState<string>('');
  const [expression, setExpression] = useState<string>(activeCst?.definition_formal ?? '');
  const [localEval, setLocalEval] = useState<RO<CalculatorResult> | null>(null);
  const [localParse, setLocalParse] = useState<RO<AnalysisFull> | null>(null);
  const valueStr =
    prepareValueString(localEval?.value ?? null, localParse?.type ?? null, schema, engine.basics, showDataText) ??
    tx('tx.rslang.value.render.tooLarge.hint');
  const stub = localEval?.value && localParse?.type?.typeID === TypeID.collection ? valueStub(localEval?.value) : '';
  const isModified = evaluatedExpression !== expression;
  const status = inferEvalStatus(localEval?.value ?? null, CstType.TERM, !isModified);
  const errors = !localParse ? null : [...localParse.errors, ...(localEval?.errors ?? [])];
  const dialogValue = localEval?.value ?? null;
  const dialogType = localParse?.type ?? null;
  const canOpenValueDialog = dialogValue != null && dialogType != null && isTypification(dialogType);

  const {
    elementRef: exportMenuRef,
    isOpen: isExportOpen,
    toggle: toggleExport,
    handleBlur: handleExportBlur,
    hide: hideExport
  } = useDropdown();

  function handleOpenCst(cstID: number) {
    void router.changeActive(cstID);
  }

  function handleCalculate() {
    setLocalEval(null);
    setLocalParse(null);
    setEvaluatedExpression(expression);

    const parse = schema.analyzer.checkFull(expression, { annotateTypes: true, annotateErrors: true });
    setLocalParse(parse);
    if (!parse.success || !parse.ast) {
      return;
    }

    const startTime = performance.now();
    const evaluation = engine.evaluateAst(parse.ast, { annotateErrors: true, disableCache: disableCache });
    setLocalEval(evaluation);

    const endTime = performance.now();
    const timeSpent = ((endTime - startTime) / 1000).toFixed(2);
    toast.success(tx('tx.rslang.eval.success', { timeSpent }));
  }

  function handleViewValue() {
    if (dialogValue == null) {
      toast.error(tx('tx.rslang.value.none'));
      return;
    }
    if (!dialogType || !isTypification(dialogType)) {
      return;
    }
    showViewValue({
      value: dialogValue,
      type: dialogType as Typification,
      engine,
      getHeaderText: activeCst ? (path: TypePath) => getStructureName(schema, activeCst, path) : undefined
    });
  }

  function handleClipboardExport() {
    hideExport();
    copyJsonToClipboard(getExportJsonText(dialogValue), () => toast.success(tx('tx.general.copy.toClipboard.success')));
  }

  function handleJSONExport() {
    hideExport();
    downloadJsonFile(getExportJsonText(dialogValue), VALUE_FILENAME);
  }

  function handleInput(event: React.KeyboardEvent<HTMLDivElement>) {
    if ((event.ctrlKey || event.metaKey) && event.code === 'KeyQ') {
      event.preventDefault();
      event.stopPropagation();
      handleCalculate();
      return;
    }
  }

  return (
    <div tabIndex={-1} id={id} className={cn('cc-column mt-2 pb-1 px-6 h-fit', className)} onKeyDown={handleInput}>
      <TextArea
        fitContent
        dense
        noResize
        noBorder
        noOutline
        transparent
        readOnly
        label={tx('tx.rslang.typification')}
        value={labelType(localParse?.type ?? null)}
        areaClassName='cursor-default'
      />

      <EditorRSExpression
        label={tx('tx.lib.defineFormal')}
        placeholder={tx('tx.lib.defineFormal.validate.empty')}
        schema={schema}
        errors={errors}
        value={expression}
        expressionType={localParse?.type ?? null}
        helpTopic={HelpTopic.UI_EVAL_STATUS}
        onAnalyze={handleCalculate}
        onChange={setExpression}
        onOpenEdit={handleOpenCst}
      />

      {dialogValue != null ? (
        <div className='flex items-center justify-center gap-6 text-sm pl-6 flex-wrap'>
          <TextButton
            text={tx('tx.rslang.value.view')}
            title={canOpenValueDialog ? '' : tx('tx.rslang.value.view.wrongType')}
            disabled={!canOpenValueDialog}
            onClick={handleViewValue}
            className='text-sm'
          />
          <div ref={exportMenuRef} onBlur={handleExportBlur} className='relative'>
            <TextButton
              text={tx('tx.general.export')}
              title={tx('tx.rslang.value.export')}
              hideTitle={isExportOpen}
              onClick={toggleExport}
            />
            <Dropdown isOpen={isExportOpen} margin='mt-1'>
              <DropdownButton text={tx('tx.general.copy.toClipboard')} onClick={handleClipboardExport} />
              <DropdownButton text={tx('tx.general.download.json')} onClick={handleJSONExport} />
            </Dropdown>
          </div>
        </div>
      ) : null}
      <ValueInput
        areaClassname='max-h-100'
        rows={8}
        value={valueStr}
        stub={stub}
        valueLabel={labelValue(localEval?.value ?? null, localParse?.type ?? null)}
        status={status}
        placeholder={tx('tx.rslang.value.none')}
        onCalculate={handleCalculate}
        onToggleDataText={toggleShowDataText}
        disabled
      />
      {localEval ? (
        <div className='-mt-2 font-math text-muted-foreground select-none'>
          {tx('tx.rslang.eval.iterationCount')}: {formatInteger(localEval.iterations)}
        </div>
      ) : null}
      {localEval ? (
        <div className='-mt-2 font-math text-muted-foreground select-none'>
          {tx('tx.rslang.eval.cacheHits')}: {formatInteger(localEval.cacheHits)}
        </div>
      ) : null}
    </div>
  );
}
