'use client';

import { useState } from 'react';

import { MiniButton } from '@/components/control';
import { DataTable } from '@/components/data-table';
import { IconReset } from '@/components/icons';
import { SearchBar } from '@/components/input';
import { cn } from '@/components/utils';
import { Text } from '@/components/view';
import { type RSEngine } from '@/domain/library';
import { makeValuePath, TypeID, type Typification, type Value, type ValuePath } from '@/domain/rslang';
import { convertPathToType, extractValue } from '@/domain/rslang/eval/value-api';
import { type TypePath } from '@/domain/rslang/semantic/typification';
import { applyPath } from '@/domain/rslang/semantic/typification-api';
import { usePreferencesStore } from '@/stores/preferences';
import { type RO } from '@/utils/meta';

import { useValueMatcher } from '../../hooks/use-value-matcher';
import { describeValue, printTypeCrumbs } from '../../labels';
import { IconShowDataText } from '../icon-show-data-text';

import { type ColumnServices, createColumnsType } from './value-columns';

interface ValueEditorProps {
  className?: string;
  engine: RSEngine;
  value: RO<Value | null>;
  type: Typification;
  rows?: number;
  perPage?: number;
  getHeaderText?: (path: TypePath) => string;
}

export function ValueViewer({ className, value, rows, perPage = 20, engine, getHeaderText, type }: ValueEditorProps) {
  const [path, setPath] = useState<ValuePath>(makeValuePath([]));
  const { filter, setFilter, matcher } = useValueMatcher(engine);
  const { data, typePath, currentType } = resolveState(value, path, type);

  const showDataText = usePreferencesStore(state => state.showDataText);
  const toggleDataText = usePreferencesStore(state => state.toggleShowDataText);

  const typeStr = printTypeCrumbs(type, typePath);
  const valueStr = describeValue(data, currentType);

  const dataRows = data === null ? [] : currentType.typeID === TypeID.collection ? (data as Value[]) : [data];
  const [filteredData, indexMap] = (() => {
    const indexMap = new Map<number, number>();
    const filteredData: Value[] = [];
    const testType = currentType.typeID === TypeID.collection ? currentType.base : currentType;
    for (let i = 0; i < dataRows.length; i++) {
      const item = dataRows[i];
      if (!matcher || matcher.match(item, testType)) {
        filteredData.push(item);
        indexMap.set(filteredData.length - 1, i);
      }
    }
    return [filteredData, indexMap];
  })();

  function handleNavigate(subPath: ValuePath) {
    setPath(prev => makeValuePath([...prev, ...subPath]));
  }

  function handleResetView() {
    setPath(makeValuePath([]));
  }

  const services: ColumnServices = {
    schema: engine.schema!,
    basics: engine.basics,
    isSingleton: currentType.typeID !== TypeID.collection,
    matcher: matcher,
    indexMap: indexMap,
    showDataText,
    navigateValue: handleNavigate,
    getColumnText: subPath => resolveColumnText(path, subPath, type, getHeaderText)
  };

  const columns = createColumnsType(currentType, services);

  return (
    <div className={cn('relative w-full flex flex-col', className)}>
      <div className='font-math select-none'>{typeStr}</div>
      <div className='grow min-w-0'>
        <div className='-mt-1 flex justify-between items-center'>
          <Text
            className='font-math font-normal mr-1 select-none'
            text={valueStr}
            title='Обозначение | Мощность множества'
          />
          <SearchBar id='dlg_value_search' noBorder query={filter} onChangeQuery={setFilter} />
          <div className='cc-icons'>
            <MiniButton
              title='Значение целиком'
              icon={<IconReset size='1.25rem' className='icon-primary' />}
              onClick={handleResetView}
              disabled={path.length === 0}
            />
            <MiniButton
              title='Отображение данных в тексте'
              icon={<IconShowDataText size='1.25rem' className='hover:text-primary' value={showDataText} />}
              onClick={toggleDataText}
            />
          </div>
        </div>
        <div className='w-full max-w-full overflow-x-auto'>
          <DataTable
            data={filteredData}
            dense
            columns={columns}
            headPosition='0rem'
            skipWidthCalculation
            rows={rows}
            contentHeight='1.29rem'
            className='cc-scroll-y text-sm select-none border'
            enablePagination
            paginationPerPage={perPage}
            paginationOptions={[perPage]}
          />
        </div>
      </div>
    </div>
  );
}

// ===== Internals =====
function resolveColumnText(
  basePath: ValuePath,
  subPath: ValuePath,
  type: Typification,
  getHeaderText?: (path: TypePath) => string
): string {
  if (!getHeaderText) {
    return '';
  }
  const valuePath = makeValuePath([...basePath, ...subPath]);
  const typePath = convertPathToType(valuePath, type);
  if (typePath === null) {
    return '';
  }
  return getHeaderText(typePath);
}

function resolveState(value: RO<Value | null>, path: ValuePath, type: Typification) {
  const data = value === null ? null : extractValue(value as Value, path);
  const typePath = convertPathToType(path, type)!;
  const currentType = applyPath(type, typePath)!;
  return { data, typePath, currentType };
}
