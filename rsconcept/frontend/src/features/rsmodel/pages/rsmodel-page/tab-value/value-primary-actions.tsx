'use client';

import { useRef } from 'react';
import { toast } from 'react-toastify';

import { type BasicBinding, type Constituenta, EvalStatus } from '@/domain/library';
import { getStructureName, isBaseSet } from '@/domain/library/rsform-api';
import { generateRandomValue, isInferrable, isInterpretable } from '@/domain/library/rsmodel-api';
import { type Value } from '@/domain/rslang';
import { isSetValue, normalizeValue } from '@/domain/rslang/eval/value-api';
import { isTypification, TypeID, type TypePath, type Typification } from '@/domain/rslang/semantic/typification';

import { useSchemaEdit } from '@/features/rsform/pages/rsform-page/schema-edit-context';
import { useCstStatus } from '@/features/rsmodel/hooks/use-cst-status';
import { processBindingData, processValueData } from '@/features/rsmodel/models/data-loading';

import { TextButton } from '@/components/control/text-button';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { useDialogsStore } from '@/stores/dialogs';
import { limits } from '@/utils/constants';
import { errorMsg, infoMsg } from '@/utils/labels';

import { copyJsonToClipboard, downloadJsonFile, getExportJsonText } from '../export-helpers';
import { useModelEdit } from '../model-edit-context';

const VALUE_FILENAME = 'value.json';
const BASIC_BINDING_APPEND_COUNT = 10;
const RANDOM_SET_APPEND_COUNT = 10;

export interface ValuePrimaryActionsProps {
  activeCst: Constituenta;
  cstData: Value | null;
  onChangeValue: (newValue: Value | BasicBinding | null) => void;
}

export function ValuePrimaryActions({ activeCst, cstData, onChangeValue }: ValuePrimaryActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { engine, isMutable } = useModelEdit();
  const { schema, isProcessing } = useSchemaEdit();
  const cstStatus = useCstStatus(engine, activeCst);

  const showEditValue = useDialogsStore(state => state.showModelEditValue);
  const showViewValue = useDialogsStore(state => state.showModelViewValue);
  const showEditBinding = useDialogsStore(state => state.showModelEditBinding);

  const typification = activeCst.analysis.type;
  const isBase = isBaseSet(activeCst.cst_type);
  const cstInferrable = isInferrable(activeCst.cst_type);
  const isImportDisabled = !isMutable || cstInferrable || !isInterpretable(activeCst.cst_type);

  const hasValueDialog = !!typification && isTypification(typification) && (cstData != null || !cstInferrable);

  const valuePayload = isBase ? (engine.basics.get(activeCst.id) ?? {}) : cstData;

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
  const showRandomButton =
    isMutable &&
    !cstInferrable &&
    !!typification &&
    isTypification(typification) &&
    cstStatus !== EvalStatus.INVALID_DATA;
  const showClearButton =
    isMutable && !cstInferrable && valuePayload !== null && !(Array.isArray(valuePayload) && valuePayload.length === 0);

  const hasPrimaryActions = showValueButton || showExportMenu || showImportMenu || showRandomButton || showClearButton;
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

  function handleAddRandomValues() {
    if (!typification || !isTypification(typification)) {
      return;
    }
    const type = typification as Typification;

    if (isBase) {
      const currentBinding = engine.basics.get(activeCst.id) ?? {};
      const existingIDs = Object.keys(currentBinding).map(Number);
      const maxID = existingIDs.length > 0 ? Math.max(...existingIDs) : 0;
      const nextBinding: BasicBinding = { ...currentBinding };
      for (let i = 1; i <= BASIC_BINDING_APPEND_COUNT; i++) {
        const id = maxID + i;
        nextBinding[id] = `${activeCst.alias}_${id}`;
      }
      onChangeValue(nextBinding);
    } else {
      const randomData = generateRandomValue(type, engine.basics, schema.cstByAlias, RANDOM_SET_APPEND_COUNT);
      if (!randomData) {
        toast.error(errorMsg.generationMissingBasic);
        return;
      }
      if (type.typeID === TypeID.collection && Array.isArray(randomData)) {
        const existingSet: Value[] = isSetValue(cstData) ? [...cstData] : [];
        const nextSet: Value[] = [...existingSet, ...randomData];
        normalizeValue(nextSet);
        onChangeValue(nextSet);
        return;
      }
      onChangeValue(randomData);
    }
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

    const processed = isBase ? processBindingData(trimmed) : processValueData(trimmed);
    if (!processed) {
      return;
    }
    onChangeValue(processed);
    toast.success(infoMsg.valueLoadedJson);
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
    if (file.size > limits.max_json_import_file_size_bytes) {
      toast.error(errorMsg.fileTooLarge(limits.max_json_import_file_size_mb));
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
          title='Просмотр или
редактирование значения'
          onClick={handleValueDialog}
        />
      ) : null}

      {showClearButton ? (
        <TextButton
          text='Очистить значение'
          title='Сбросить вычисленное значение текущей конституенты'
          onClick={handleClearValue}
          disabled={isProcessing}
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

      {showRandomButton ? (
        <TextButton
          text={typification.typeID === TypeID.collection ? 'Добавить случайные' : 'Случайное значение'}
          title='Сгенерировать случайные значения для текущей конституенты'
          onClick={handleAddRandomValues}
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
