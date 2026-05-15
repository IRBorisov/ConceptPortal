'use client';

import { useRef } from 'react';
import { toast } from 'react-toastify';

import { type BasicBinding, type Constituenta, CstType, EvalStatus } from '@/domain/library';
import { getStructureName, isBaseSet } from '@/domain/library/rsform-api';
import { generateRandomValue, isInferrable, isInterpretable } from '@/domain/library/rsmodel-api';
import { type Value } from '@/domain/rslang';
import { isSetValue, normalizeValue } from '@/domain/rslang/eval/value-api';
import { isTypification, TypeID, type TypePath, type Typification } from '@/domain/rslang/semantic/typification';
import { useTx } from '@/i18n';

import { PillValueClass } from '@/features/rsform/components/pill-valueClass';
import { useSchemaEdit } from '@/features/rsform/pages/rsform-page/schema-edit-context';
import { useCstStatus } from '@/features/rsmodel/hooks/use-cst-status';
import { processBindingData, processValueData } from '@/features/rsmodel/models/data-loading';

import { TextButton } from '@/components/control/text-button';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { limits } from '@/utils/constants';

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
  const tx = useTx();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { engine, isMutable } = useModelEdit();
  const { schema, isProcessing, isContentEditable, toggleValueClass } = useSchemaEdit();
  const isModified = useModificationStore(state => state.isModified);
  const cstStatus = useCstStatus(engine, activeCst);

  const showEditValue = useDialogsStore(state => state.showModelEditValue);
  const showViewValue = useDialogsStore(state => state.showModelViewValue);
  const showEditBinding = useDialogsStore(state => state.showModelEditBinding);

  const typification = activeCst.effectiveType;
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

  const isProperty = activeCst.value_is_property;
  const showValueClassPill =
    activeCst.cst_type === CstType.BASE ||
    activeCst.cst_type === CstType.CONSTANT ||
    activeCst.cst_type === CstType.STRUCTURED;

  const metaFieldsDisabled = !isContentEditable || isProcessing;

  const hasPrimaryActions =
    showValueButton || showExportMenu || showImportMenu || showRandomButton || showClearButton || showValueClassPill;
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
    const type = activeCst.effectiveType as Typification;
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
      toast.error(tx('tx.rslang.value.none'));
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
        toast.error(tx('tx.rslang.value.add.random.fail'));
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
      toast.error(tx('tx.rslang.value.none'));
      return;
    }

    const processed = isBase ? processBindingData(trimmed) : processValueData(trimmed);
    if (!processed) {
      return;
    }
    onChangeValue(processed);
    toast.success(tx('tx.rslang.value.load.success'));
  }

  function handleClipboardExport() {
    hideExport();
    const jsonText = getExportJsonText(getExportPayload());
    copyJsonToClipboard(jsonText, () => toast.success(tx('tx.general.copy.toClipboard.success')));
  }

  function handleJSONExport() {
    hideExport();
    const jsonText = getExportJsonText(getExportPayload());
    downloadJsonFile(jsonText, `${activeCst.alias}_${VALUE_FILENAME}`);
  }

  function handleClipboardImport() {
    hideImport();

    if (isImportDisabled) {
      return;
    }
    navigator.clipboard
      .readText()
      .then(text => applyImportedJsonText(text))
      .catch(error => {
        toast.error(error instanceof Error ? error.message : tx('tx.general.load.fromClipboard.fail'));
        console.error(error);
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
      toast.error(tx('tx.general.file.error.maxSize', { maxMb: limits.max_json_import_file_size_mb }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      applyImportedJsonText(result);
    };
    reader.onerror = () => toast.error(tx('tx.general.file.error.read'));
    reader.readAsText(file);
  }

  return (
    <div className='flex flex-wrap items-center gap-6 text-sm'>
      {showValueClassPill ? (
        <PillValueClass
          value={!isProperty}
          toggleValue={toggleValueClass}
          disabled={metaFieldsDisabled || isModified || activeCst.is_inherited}
        />
      ) : null}

      {showValueButton ? (
        <TextButton
          text={!cstInferrable && isMutable ? tx('tx.rslang.value.edit') : tx('tx.rslang.value.view')}
          title={tx('tx.rslang.value.edit.hint')}
          onClick={handleValueDialog}
        />
      ) : null}

      {showClearButton ? (
        <TextButton
          text={tx('tx.general.discard')}
          title={tx('tx.rslang.value.reset.hint')}
          onClick={handleClearValue}
          disabled={isProcessing}
        />
      ) : null}

      {showExportMenu ? (
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
      ) : null}

      {showImportMenu ? (
        <div ref={importMenuRef} onBlur={handleImportBlur} className='relative'>
          <TextButton
            text={tx('tx.general.import')}
            title={tx('tx.rslang.value.import')}
            hideTitle={isImportOpen}
            onClick={toggleImport}
          />
          <Dropdown isOpen={isImportOpen} margin='mt-1'>
            <DropdownButton text={tx('tx.general.load.fromClipboard')} onClick={handleClipboardImport} />
            <DropdownButton text={tx('tx.general.load.fromJson')} onClick={handleJSONImport} />
          </Dropdown>
        </div>
      ) : null}

      {showRandomButton ? (
        <TextButton
          text={tx('tx.rslang.value.add.random')}
          title={tx('tx.rslang.value.add.random.hint')}
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
