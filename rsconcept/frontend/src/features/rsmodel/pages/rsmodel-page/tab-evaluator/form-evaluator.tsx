'use client';

import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { type ReactCodeMirrorRef } from '@uiw/react-codemirror';

import { CstType } from '@/domain/library';
import { getStructureName } from '@/domain/library/rsform-api';
import { inferEvalStatus, prepareValueString } from '@/domain/library/rsmodel-api';
import { type AnalysisFull, type CalculatorResult, type RSErrorDescription, TokenID } from '@/domain/rslang';
import { valueStub } from '@/domain/rslang/eval/value-api';
import { labelType } from '@/domain/rslang/labels';
import { isTypification, TypeID, type TypePath, type Typification } from '@/domain/rslang/semantic/typification';

import { useConceptNavigation } from '@/app';
import { RSEditorControls } from '@/features/rsform/components/editor-rsexpression/rs-edit-controls';
import { RSInput } from '@/features/rsform/components/rs-input';
import { RSTextWrapper } from '@/features/rsform/components/rs-input/text-editing';
import { ViewErrors } from '@/features/rsform/components/view-errors';
import { useSchemaEdit } from '@/features/rsform/pages/rsform-page/schema-edit-context';

import { TextButton } from '@/components/control/text-button';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { TextArea, TextInput } from '@/components/input';
import { cn } from '@/components/utils';
import { useDialogsStore } from '@/stores/dialogs';
import { usePreferencesStore } from '@/stores/preferences';
import { errorMsg, infoMsg, placeholderMsg } from '@/utils/labels';
import { type RO } from '@/utils/meta';

import { ValueInput } from '../../../components/value-input';
import { labelValue } from '../../../labels';
import { copyJsonToClipboard, downloadJsonFile, getExportJsonText } from '../export-helpers';
import { useModelEdit } from '../model-edit-context';
import { ToolbarExpression } from '../tab-value/toolbar-expression';

const VALUE_FILENAME = 'eval_value.json';

interface FormEvaluatorProps {
  id?: string;
  className?: string;
}

export function FormEvaluator({ id, className }: FormEvaluatorProps) {
  const router = useConceptNavigation();
  const { schema, activeCst } = useSchemaEdit();
  const { engine } = useModelEdit();

  const showDataText = usePreferencesStore(state => state.showDataText);
  const toggleShowDataText = usePreferencesStore(state => state.toggleShowDataText);
  const showViewValue = useDialogsStore(state => state.showModelViewValue);

  const rsInput = useRef<ReactCodeMirrorRef>(null);
  const [evaluatedExpression, setEvaluatedExpression] = useState<string>('');
  const [expression, setExpression] = useState<string>(activeCst?.definition_formal ?? '');
  const [localEval, setLocalEval] = useState<RO<CalculatorResult> | null>(null);
  const [localParse, setLocalParse] = useState<RO<AnalysisFull> | null>(null);
  const valueStr =
    prepareValueString(localEval?.value ?? null, localParse?.type ?? null, schema, engine.basics, showDataText) ??
    placeholderMsg.valueTooLarge;
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

  function handleEdit(id: TokenID, key?: string) {
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
    toast.success(infoMsg.calculationSuccess(timeSpent));
  }

  function handleViewValue() {
    if (dialogValue == null) {
      toast.error(errorMsg.valueNull);
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
    copyJsonToClipboard(getExportJsonText(dialogValue), () => toast.success(infoMsg.valueReady));
  }

  function handleJSONExport() {
    hideExport();
    downloadJsonFile(getExportJsonText(dialogValue), VALUE_FILENAME);
  }

  function handleShowError(error: RO<RSErrorDescription>) {
    if (!rsInput.current) {
      return;
    }
    rsInput.current?.view?.dispatch({
      selection: {
        anchor: error.from,
        head: error.to
      }
    });
    rsInput.current?.view?.focus();
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
        label='Типизация'
        value={labelType(localParse?.type ?? null)}
        areaClassName='cursor-default'
      />

      <div className='relative'>
        <ToolbarExpression
          className='absolute -top-1 right-0 -translate-y-full'
          expression={expression}
          type={localParse?.type ?? null}
        />
        <RSInput
          ref={rsInput}
          placeholder='Выражение отсутствует'
          schema={schema}
          errors={errors}
          value={expression}
          onChange={setExpression}
          onOpenEdit={handleOpenCst}
        />
        <RSEditorControls isOpen={true} onEdit={handleEdit} />
      </div>
      <ViewErrors
        className='-mt-3'
        onShowError={handleShowError}
        isOpen={!!errors && errors.length > 0}
        errors={errors}
      />

      {dialogValue != null ? (
        <div className='flex items-center justify-center gap-6 text-sm pl-6 flex-wrap'>
          <TextButton
            text='Смотреть значение'
            titleHtml={
              canOpenValueDialog
                ? 'Просмотр значения'
                : 'Просмотр структурированного значения<br/>недоступен для этого типа'
            }
            disabled={!canOpenValueDialog}
            onClick={handleViewValue}
            className='text-sm'
          />
          <div ref={exportMenuRef} onBlur={handleExportBlur} className='relative'>
            <TextButton
              text='Экспорт'
              title='Экспортировать значение'
              hideTitle={isExportOpen}
              onClick={toggleExport}
            />
            <Dropdown isOpen={isExportOpen} margin='mt-1'>
              <DropdownButton text='Скопировать в буфер' onClick={handleClipboardExport} />
              <DropdownButton text='Сохранить как JSON' onClick={handleJSONExport} />
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
        placeholder='Значение отсутствует'
        onCalculate={handleCalculate}
        onToggleDataText={toggleShowDataText}
        disabled
      />
      {!!localEval?.iterations ? (
        <TextInput
          label='Количество итераций'
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
