'use client';

import { useState } from 'react';

import { type Constituenta } from '@/features/rsform';

import { makeValuePath, TypeID, type Typification, type Value, type ValuePath } from '@/domain/rslang';
import { convertPathToType, extractValue } from '@/domain/rslang/eval/value-api';
import { applyPath } from '@/domain/rslang/semantic/typification-api';

import { type RSEngine } from '../../models/rsengine';
import { addValueElement, deleteValueElement, updateValueElement } from '../../models/rsmodel-api';

export function useValueEditorState(
  engine: RSEngine,
  value: Value | null,
  type: Typification,
  onChange?: (newValue: Value | null) => void
) {
  const [path, setPath] = useState<ValuePath>(makeValuePath([]));
  const { data, typePath, currentType } = resolveState(value, path, type);

  const [selectedPath, setSelectedPath] = useState<ValuePath | null>(null);
  const selectedValue = selectedPath !== null && data !== null ? extractValue(data, selectedPath) : null;
  const selectedCst = resolveSelectedConstituenta(engine, selectedPath, currentType);
  const selectedBasics = selectedCst ? (engine.basics.get(selectedCst.id) ?? null) : null;

  function handleNavigate(subPath: ValuePath) {
    setPath(prev => makeValuePath([...prev, ...subPath]));
    setSelectedPath(null);
  }

  function handleSelectElement(subPath: ValuePath | null) {
    setSelectedPath(subPath);
  }

  function handleChangeSelected(newValue: number) {
    if (!onChange) {
      return;
    }
    const updatedValue = updateValueElement(value, makeValuePath([...path, ...(selectedPath ?? [])]), newValue);
    if (updatedValue !== value) {
      onChange(updatedValue);
    }
  }

  function handleDeleteElement(target: number) {
    if (!onChange) {
      return;
    }

    const updatedValue = deleteValueElement(value, path, type, target);
    setSelectedPath(null);
    onChange(updatedValue);
  }

  function handleAddElement() {
    if (!onChange) {
      return;
    }

    const updatedValue = addValueElement(value, path, type, currentType);
    setSelectedPath(null);
    onChange(updatedValue);
  }

  function handleResetView() {
    setPath(makeValuePath([]));
    setSelectedPath(null);
  }

  return {
    currentType,
    data,
    handleAddElement,
    handleChangeSelected,
    handleDeleteElement,
    handleNavigate,
    handleResetView,
    handleSelectElement,
    path,
    typePath,
    selectedBasics,
    selectedCst,
    selectedPath,
    selectedValue
  };
}

// ===== Internals =====
function resolveSelectedConstituenta(
  engine: RSEngine,
  path: ValuePath | null,
  baseType: Typification
): Constituenta | null {
  if (path === null) {
    return null;
  }

  const typePath = convertPathToType(path, baseType);
  if (typePath === null) {
    return null;
  }

  const type = applyPath(baseType, typePath);
  if (type?.typeID !== TypeID.basic) {
    return null;
  }

  return engine.schema?.cstByAlias.get(type.baseID) ?? null;
}

function resolveState(value: Value | null, path: ValuePath, type: Typification) {
  const data = value === null ? null : extractValue(value, path);
  const typePath = convertPathToType(path, type)!;
  const currentType = applyPath(type, typePath)!;
  return { data, typePath, currentType };
}
