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
import { useTx } from '@/i18n/use-tx';

import { useConceptNavigation } from '@/app';
import { HelpTopic } from '@/features/help';
import { EditorRSExpression } from '@/features/rsform/components/editor-rsexpression/editor-rsexpression';
import { useSchemaEdit } from '@/features/rsform/pages/rsform-page/schema-edit-context';

import { TextButton } from '@/components/control/text-button';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { TextArea, TextInput } from '@/components/input';
import { cn } from '@/components/utils';
import { useDialogsStore } from '@/stores/dialogs';
import { usePreferencesStore } from '@/stores/preferences';
import { formatLabel, lid } from '@/utils/labels';
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
  const showViewValue = useDialogsStore(state => state.showModelViewValue);

  const [evaluatedExpression, setEvaluatedExpression] = useState<string>('');
  const [expression, setExpression] = useState<string>(activeCst?.definition_formal ?? '');
  const [localEval, setLocalEval] = useState<RO<CalculatorResult> | null>(null);
  const [localParse, setLocalParse] = useState<RO<AnalysisFull> | null>(null);
  const valueStr =
    prepareValueString(localEval?.value ?? null, localParse?.type ?? null, schema, engine.basics, showDataText) ??
    formatLabel(lid.placeholder.valueTooLarge);
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
    const evaluation = engine.evaluateAst(parse.ast, { annotateErrors: true });
    setLocalEval(evaluation);

    const endTime = performance.now();
    const timeSpent = ((endTime - startTime) / 1000).toFixed(2);
    toast.success(formatLabel(lid.info.calculationSuccess, { timeSpent }));
  }

  function handleViewValue() {
    if (dialogValue == null) {
      toast.error(formatLabel(lid.error.valueNull));
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
    copyJsonToClipboard(getExportJsonText(dialogValue), () => toast.success(formatLabel(lid.info.valueReady)));
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
    <div tabIndex={-1} id={id} className={cn('cc-column mt-1 pb-1 px-6 h-fit', className)} onKeyDown={handleInput}>
      <TextArea
        fitContent
        dense
        noResize
        noBorder
        noOutline
        transparent
        readOnly
        label={tx('ui.label.typification', 'Typification')}
        value={labelType(localParse?.type ?? null)}
        areaClassName='cursor-default'
      />

      <EditorRSExpression
        label={tx('ui.label.expression', 'Expression')}
        placeholder={tx('ui.placeholder.expressionMissing', 'No expression')}
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
            text={tx('ui.eval.viewValue', 'View value')}
            title={
              canOpenValueDialog
                ? tx('ui.eval.viewValueHint', 'View value')
                : tx('ui.eval.viewStructuredUnavailable', 'Structured value view is not available for this type')
            }
            disabled={!canOpenValueDialog}
            onClick={handleViewValue}
            className='text-sm'
          />
          <div ref={exportMenuRef} onBlur={handleExportBlur} className='relative'>
            <TextButton
              text={tx('ui.action.exportShort', 'Export')}
              title={tx('ui.value.exportValueTitle', 'Export value')}
              hideTitle={isExportOpen}
              onClick={toggleExport}
            />
            <Dropdown isOpen={isExportOpen} margin='mt-1'>
              <DropdownButton
                text={tx('ui.eval.copyToClipboard', 'Copy to clipboard')}
                onClick={handleClipboardExport}
              />
              <DropdownButton text={tx('ui.eval.saveAsJson', 'Save as JSON')} onClick={handleJSONExport} />
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
        placeholder={tx('ui.placeholder.valueMissing', 'No value')}
        onCalculate={handleCalculate}
        onToggleDataText={toggleShowDataText}
        disabled
      />
      {!!localEval?.iterations ? (
        <TextInput
          label={tx('ui.label.iterationCount', 'Iteration count')}
          dense
          disabled
          noBorder
          className='mt-6 text-muted-foreground'
          value={String(localEval.iterations)}
        />
      ) : null}
    </div>
  );
}
