'use client';

import { useRef } from 'react';
import { toast } from 'react-toastify';

import { type BasicBinding, type Constituenta } from '@/domain/library';
import { getStructureName, isBaseSet } from '@/domain/library/rsform-api';
import { isInferrable, isInterpretable } from '@/domain/library/rsmodel-api';
import { type Value } from '@/domain/rslang';
import { isTypification, type TypePath, type Typification } from '@/domain/rslang/semantic/typification';

import { useSchemaEdit } from '@/features/rsform/pages/rsform-page/schema-edit-context';

import { TextButton } from '@/components/control/text-button';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { useDialogsStore } from '@/stores/dialogs';
import { errorMsg, infoMsg } from '@/utils/labels';

import { copyJsonToClipboard, downloadJsonFile, getExportJsonText } from '../export-helpers';
import { useModelEdit } from '../model-edit-context';

const VALUE_FILENAME = 'value.json';

export interface ValuePrimaryActionsProps {
  activeCst: Constituenta;
  cstData: Value | null;
  onChangeValue: (newValue: Value | BasicBinding | null) => void;
}

export function ValuePrimaryActions({ activeCst, cstData, onChangeValue }: ValuePrimaryActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { engine, isMutable } = useModelEdit();
  const { schema, isProcessing } = useSchemaEdit();

  const showEditValue = useDialogsStore(state => state.showModelEditValue);
  const showViewValue = useDialogsStore(state => state.showModelViewValue);
  const showEditBinding = useDialogsStore(state => state.showModelEditBinding);

  const typification = activeCst.analysis.type;
  const isBase = isBaseSet(activeCst.cst_type);
  const cstInferrable = isInferrable(activeCst.cst_type);
  const isImportDisabled = !isMutable || cstInferrable || !isInterpretable(activeCst.cst_type);

  const hasValueDialog = !!typification && isTypification(typification) && (cstData != null || !cstInferrable);

  const valuePayload = isBase ? (engine.basics.get(activeCst.id) ?? ({} as BasicBinding)) : cstData;

  const {
    elementRef: exportMenuRef,
    isOpen: isExportOpen,
    toggle: toggleExport,
    handleBlur: handleExportBlur,
    hide: hideExport
  } = useDropdown();
  const {
    elementRef: importMenuRef,
    isOpen: isImportOpen,
    toggle: toggleImport,
    handleBlur: handleImportBlur,
    hide: hideImport
  } = useDropdown();

  const showValueButton = hasValueDialog;
  const showExportMenu = valuePayload != null;
  const showImportMenu = !isImportDisabled;
  const showClearButton =
    isMutable &&
    !cstInferrable &&
    valuePayload !== null &&
    !(Array.isArray(valuePayload) && valuePayload.length === 0);

  const hasPrimaryActions = showValueButton || showExportMenu || showImportMenu || showClearButton;
  if (!hasPrimaryActions) {
    return null;
  }

  function handleValueDialog() {
    if (isBase) {
      showEditBinding({
        initialValue: engine.basics.get(activeCst.id) ?? {},
        onChange: isMutable ? onChangeValue : undefined
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
        onChange: onChangeValue,
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

  function handleClearValue() {
    void engine.resetValue(activeCst.id);
  }

  function getExportPayload(): Value | BasicBinding {
    return isBase ? (engine.basics.get(activeCst.id) ?? {}) : cstData!;
  }

  function applyImportedJsonText(text: string) {
    const trimmed = text.trim();
    if (!trimmed) {
      toast.error(errorMsg.valueNull);
      return;
    }
    try {
      const parsed = JSON.parse(trimmed) as Value | BasicBinding;
      onChangeValue(parsed);
      toast.success(infoMsg.valueLoadedJson);
    } catch (error) {
      toast.error((error as Error).message);
      console.error(error);
    }
  }

  function handleClipboardExport() {
    hideExport();
    copyJsonToClipboard(getExportJsonText(getExportPayload()), () => toast.success(infoMsg.valueReady));
  }

  function handleJSONExport() {
    hideExport();
    downloadJsonFile(getExportJsonText(getExportPayload()), `${activeCst.alias}_${VALUE_FILENAME}`);
  }

  function handleClipboardImport() {
    hideImport();

    if (isImportDisabled) {
      return;
    }
    navigator.clipboard
      .readText()
      .then(text => {
        applyImportedJsonText(text);
      })
      .catch(() => {
        toast.error(errorMsg.clipboardRead);
      });
  }

  function handleJSONImport() {
    hideImport();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (isImportDisabled) {
      return;
    }
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      applyImportedJsonText(result);
    };
    reader.onerror = () => toast.error(errorMsg.fileRead);
    reader.readAsText(file);
  }

  return (
    <div className='flex items-center gap-6 text-sm'>
      {showValueButton ? (
        <TextButton
          text={!cstInferrable && isMutable ? 'Изменить значение' : 'Смотреть значение'}
          titleHtml='Просмотр или<br/>редактирование значения'
          onClick={handleValueDialog}
        />
      ) : null}

      {showExportMenu ? (
        <div ref={exportMenuRef} onBlur={handleExportBlur} className='relative'>
          <TextButton text='Экспорт' title='Экспортировать значение' hideTitle={isExportOpen} onClick={toggleExport} />
          <Dropdown isOpen={isExportOpen} margin='mt-1'>
            <DropdownButton text='Скопировать в буфер' onClick={handleClipboardExport} />
            <DropdownButton text='Сохранить как JSON' onClick={handleJSONExport} />
          </Dropdown>
        </div>
      ) : null}

      {showImportMenu ? (
        <div ref={importMenuRef} onBlur={handleImportBlur} className='relative'>
          <TextButton text='Импорт' title='Импортировать значение' hideTitle={isImportOpen} onClick={toggleImport} />
          <Dropdown isOpen={isImportOpen} margin='mt-1'>
            <DropdownButton text='Загрузить из буфера' onClick={handleClipboardImport} />
            <DropdownButton text='Загрузить из JSON' onClick={handleJSONImport} />
          </Dropdown>
        </div>
      ) : null}

      {showClearButton ? (
        <TextButton
          text='Очистить значение'
          title='Сбросить вычисленное значение текущей конституенты'
          onClick={handleClearValue}
          disabled={isProcessing}
        />
      ) : null}

      <input
        type='file'
        accept='.json,application/json'
        className='hidden'
        ref={fileInputRef}
        onChange={handleFileChange}
        tabIndex={-1}
      />
    </div>
  );
}
