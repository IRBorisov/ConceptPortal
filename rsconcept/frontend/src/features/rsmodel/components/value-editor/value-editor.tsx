'use client';

import { useState } from 'react';

import { type Constituenta } from '@/features/rsform';
import { makeValuePath, TypeID, type Typification, type Value, type ValuePath } from '@/features/rslang';
import { convertPathToType, extractValue, makeDefaultValue, valueStub } from '@/features/rslang/eval/value-api';
import { type EchelonCollection, type TypePath } from '@/features/rslang/semantic/typification';
import { applyPath } from '@/features/rslang/semantic/typification-api';

import { MiniButton } from '@/components/control';
import { DataTable } from '@/components/data-table';
import { IconNewItem, IconReset } from '@/components/icons';
import { SearchBar } from '@/components/input';
import { cn } from '@/components/utils';
import { NoData } from '@/components/view';
import { usePreferencesStore } from '@/stores/preferences';

import { printTypeCrumbs } from '../../labels';
import { type RSEngine } from '../../models/rsengine';
import { IconShowDataText } from '../icon-show-data-text';

import { PickElement } from './pick-element';
import { type ColumnServices, createColumnsType } from './value-columns';

interface ValueEditorProps {
  className?: string;
  engine: RSEngine;
  value: Value | null;
  type: Typification;
  getHeaderText?: (path: TypePath) => string;
  onChange?: (newValue: Value | null) => void;
}

/** Displays a badge with value cardinality and information tooltip. */
export function ValueEditor({ className, value, engine, getHeaderText, type, onChange }: ValueEditorProps) {
  const [data, setData] = useState<Value | null>(value);
  const [path, setPath] = useState<ValuePath>(makeValuePath([]));
  const typePath = convertPathToType(path, type)!;
  const currentType = applyPath(type, typePath)!;

  const [selectedPath, setSelectedPath] = useState<ValuePath | null>(null);
  const selectedValue = selectedPath !== null ? extractValue(data!, selectedPath) : null;
  const selectedCst = selectedPath !== null ? deduceSelectedCst(engine, selectedPath, currentType) : null;
  const selectedBasics = selectedCst ? engine.basics.get(selectedCst.id) ?? null : null;

  const [filter, setFilter] = useState('');
  // const [filterDebounced] = useDebounce(filter, PARAMETER.searchDebounce);

  const showDataText = usePreferencesStore(state => state.showDataText);
  const toggleDataText = usePreferencesStore(state => state.toggleShowDataText);

  const typeStr = typePath ? printTypeCrumbs(type, typePath) : 'N/A';
  const valueStr = (() => {
    const stub = valueStub(data);
    if (currentType.typeID !== TypeID.collection) {
      return stub;
    } else {
      return `${stub} | ${(data as Value[]).length}`;
    }
  })();

  function handleNavigate(subPath: ValuePath) {
    const newValue = extractValue(value!, makeValuePath([...path, ...subPath]));
    if (newValue === null) {
      console.error('Invalid navigation path - invalid value');
      return;
    }

    setData(newValue);
    setPath(prev => makeValuePath([...prev, ...subPath]));
    setSelectedPath(null);
  }

  function handleSelectElement(subPath: ValuePath | null) {
    setSelectedPath(subPath);
  }

  function handleChangeSelected(newValue: number) {
    if (selectedPath === null) {
      return;
    }
    if (selectedPath.length === 0) {
      onChange!(newValue);
      setData(newValue);
      return;
    }
    const mutableRef = extractValue(value!, makeValuePath(path))!;
    const cValue = extractValue(mutableRef, makeValuePath(selectedPath.slice(0, -1))) as Value[];
    cValue[selectedPath.at(-1)!] = newValue;
    setData([...mutableRef as Value[]]);
    onChange!(value);
  }

  function handleDeleteElement(target: number) {
    if (path.length === 0 && type.typeID !== TypeID.collection) {
      setData(null);
      setSelectedPath(null);
      onChange!(null);
      return;
    }
    const mutableRef = extractValue(value!, makeValuePath(path))! as Value[];
    mutableRef.splice(target, 1);
    setSelectedPath(null);
    setData([...mutableRef]);
    onChange!(value);
  }

  function handleAddElement() {
    if (path.length === 0 && type.typeID !== TypeID.collection) {
      const newElem = makeDefaultValue(type);
      setData(newElem);
      onChange!(newElem);
    }
    const newElem = makeDefaultValue((currentType as EchelonCollection).base);
    const mutableRef = extractValue(value!, makeValuePath(path))! as Value[];
    mutableRef.unshift(newElem);
    setSelectedPath(null);
    setData([...mutableRef]);
    onChange!(value);
  }

  function handleResetView() {
    setData(value);
    setPath(makeValuePath([]));
    setSelectedPath(null);
  }

  function getColumnText(subPath: ValuePath): string {
    if (!getHeaderText) {
      return '';
    }
    const vPath = makeValuePath([...path, ...subPath]);
    const tPath = convertPathToType(vPath, type);
    if (tPath === null) {
      return '';
    }
    return getHeaderText(tPath);
  }

  const services: ColumnServices = {
    schema: engine.schema!,
    basics: engine.basics,
    showDataText,
    navigateValue: handleNavigate,
    getColumnText: getColumnText,
    selectElement: onChange ? handleSelectElement : undefined,
    deleteElement: onChange ? handleDeleteElement : undefined
  };

  const columns = createColumnsType(currentType, selectedPath, services);

  return (
    <div className={cn('relative w-full flex flex-col', className)}>
      <div className='font-math select-none'>{typeStr}</div>
      <div className='flex gap-3'>
        <div className='grow min-w-0'>
          <div className='-mt-1 flex justify-between items-center'>
            <span className='font-math mr-1'>{valueStr}</span>
            <SearchBar
              id='dlg_value_search'
              noBorder
              query={filter}
              onChangeQuery={setFilter}
            />
            <div className='cc-icons'>
              <MiniButton
                title='Значение целиком'
                icon={<IconReset size='1.25rem' className='icon-primary' />}
                onClick={handleResetView}
                disabled={path.length === 0}
              />
              {onChange ? (<MiniButton
                title='Добавить элемент'
                icon={<IconNewItem size='1.25rem' className='icon-green' />}
                onClick={handleAddElement}
                disabled={currentType.typeID !== TypeID.collection && value !== null}
              />) : null}
              <MiniButton
                title='Отображение данных в тексте'
                icon={<IconShowDataText size='1.25rem' className='hover:text-primary' value={showDataText} />}
                onClick={toggleDataText}
              />
            </div>
          </div>
          <div className='w-full max-w-full overflow-x-auto'>
            <DataTable
              data={
                data === null ? [] :
                  currentType.typeID === TypeID.collection ?
                    data as Value[] :
                    [data]
              }
              dense
              columns={columns}
              skipWidthCalculation
              rows={18}
              className='cc-scroll-y text-sm select-none border min-w-60'
              enablePagination
              paginationPerPage={20}
              paginationOptions={[20]}
              noDataComponent={
                <NoData>
                  <p>{currentType.typeID === TypeID.collection ? 'Пустое множество' : 'Значение отсутствует'}</p>
                </NoData>}
              headPosition='0rem'
            />
          </div>
        </div>
        {!!onChange ? (<PickElement
          className='shrink-0 w-60'
          alias={selectedCst?.alias ?? ''}
          term={selectedCst?.term_resolved ?? ''}
          binding={selectedBasics}
          isInteger={selectedValue !== null && selectedCst === null}
          value={selectedValue as number | null}
          onChange={handleChangeSelected}
        />) : null}
      </div>
    </div>
  );
}

// ===== Internals =====
function deduceSelectedCst(engine: RSEngine, path: ValuePath, baseType: Typification): Constituenta | null {
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