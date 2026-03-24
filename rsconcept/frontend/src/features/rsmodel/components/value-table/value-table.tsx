'use client';

import { useState } from 'react';

import { makeValuePath, TypeID, type Typification, type Value, type ValuePath } from '@/features/rslang';
import { convertPathToType, extractValue, makeDefaultValue, valueStub } from '@/features/rslang/eval/value-api';
import { type EchelonCollection, type TypePath } from '@/features/rslang/semantic/typification';
import { applyPath } from '@/features/rslang/semantic/typification-api';

import { MiniButton } from '@/components/control';
import { DataTable } from '@/components/data-table';
import { IconNewItem, IconReset } from '@/components/icons';
import { cn } from '@/components/utils';
import { NoData } from '@/components/view';
import { useFitHeight } from '@/stores/app-layout';
import { usePreferencesStore } from '@/stores/preferences';
import { notImplemented } from '@/utils/utils';

import { printTypeCrumbs } from '../../labels';
// import { notImplemented } from '@/utils/utils';
import { type RSEngine } from '../../models/rsengine';
import { IconShowDataText } from '../icon-show-data-text';

import { type ColumnServices, createColumnsType } from './value-columns';

interface ValueTableProps {
  className?: string;
  engine: RSEngine;
  value: Value | null;
  type: Typification;
  heightMargin?: string;
  getHeaderText?: (path: TypePath) => string;
  onChange?: (newValue: Value | null) => void;
}

/** Displays a badge with value cardinality and information tooltip. */
export function ValueTable({ className, heightMargin, value, engine, getHeaderText, type, onChange }: ValueTableProps) {
  const [currentValue, setCurrentValue] = useState<Value | null>(value);
  const [data, setData] = useState<Value | null>(value);
  const [currentType, setCurrentType] = useState<Typification>(type);
  const [path, setPath] = useState<ValuePath>(makeValuePath([]));
  const typePath = convertPathToType(path, type);

  const showDataText = usePreferencesStore(state => state.showDataText);
  const toggleDataText = usePreferencesStore(state => state.toggleShowDataText);

  const typeStr = typePath ? printTypeCrumbs(type, typePath) : 'N/A';
  const valueStr = (() => {
    const stub = valueStub(currentValue);
    if (currentType.typeID !== TypeID.collection) {
      return stub;
    } else {
      return `${stub} | ${(currentValue as Value[]).length}`;
    }
  })();

  const tableHeight = useFitHeight(heightMargin ?? '');

  function handleNavigate(subPath: ValuePath) {
    const newTypePath = convertPathToType(subPath, currentType);
    if (newTypePath === null) {
      console.error('Invalid navigation path - invalid type path');
      return;
    }
    const newType = applyPath(currentType, newTypePath);
    if (newType === null) {
      console.error('Invalid navigation path - invalid new type');
      return;
    }
    const newValue = extractValue(currentValue!, subPath);
    if (newValue === null) {
      console.error('Invalid navigation path - invalid value');
      return;
    }

    setCurrentType(newType);
    setCurrentValue(newValue);
    setData(newValue);
    setPath(prev => makeValuePath([...prev, ...subPath]));
  }

  function handleEditElement(subPath: ValuePath) {
    console.log('Edit element: ', subPath);
    notImplemented();
  }

  function handleDeleteElement(target: number) {
    if (path.length === 0 && type.typeID !== TypeID.collection) {
      setCurrentValue(null);
      setData(null);
      onChange!(null);
      return;
    }
    const cValue = currentValue as Value[];
    cValue.splice(target, 1);
    setData([...cValue]);
    onChange!(value);
  }

  function handleAddElement() {
    if (path.length === 0 && type.typeID !== TypeID.collection) {
      const newElem = makeDefaultValue(type);
      setCurrentValue(newElem);
      setData(newElem);
      onChange!(newElem);
    }
    const newElem = makeDefaultValue((currentType as EchelonCollection).base);
    const cValue = currentValue as Value[];
    cValue.push(newElem);
    setData([...cValue]);
    onChange!(value);
  }

  function handleResetView() {
    setCurrentValue(value);
    setData(value);
    setCurrentType(type);
    setPath(makeValuePath([]));
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
    editElement: onChange ? handleEditElement : undefined,
    deleteElement: onChange ? handleDeleteElement : undefined
  };

  const columns = createColumnsType(currentType, services);

  return (
    <div className={cn('relative w-full flex flex-col', className)}>
      <div className='font-math select-none'>{typeStr}</div>
      <div className='flex gap-3'>
        <div className='grow min-w-0'>
          <div className='flex justify-between'>
            <span className='font-math'>{valueStr}</span>
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
                disabled={currentType.typeID !== TypeID.collection && currentValue !== null}
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
              dense
              data={
                data === null ? [] :
                  currentType.typeID === TypeID.collection ?
                    data as Value[] :
                    [data]
              }
              columns={columns}
              style={{ maxHeight: heightMargin ? tableHeight : undefined }}
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
        {!!onChange ? (<div className='shrink-0 w-40'>
          Выбор элемента
        </div>) : null}
      </div>
    </div>
  );
}
