'use client';

import { makeValuePath, TypeID, type Typification, type Value, type ValuePath } from '@/features/rslang';
import { convertPathToType } from '@/features/rslang/eval/value-api';
import { type TypePath } from '@/features/rslang/semantic/typification';

import { MiniButton } from '@/components/control';
import { DataTable } from '@/components/data-table';
import { IconNewItem, IconReset } from '@/components/icons';
import { SearchBar } from '@/components/input';
import { cn } from '@/components/utils';
import { NoData, Text } from '@/components/view';
import { usePreferencesStore } from '@/stores/preferences';

import { useValueMatcher } from '../../hooks/use-value-matcher';
import { describeValue, printTypeCrumbs } from '../../labels';
import { type RSEngine } from '../../models/rsengine';
import { IconShowDataText } from '../icon-show-data-text';

import { PickElement } from './pick-element';
import { useValueEditorState } from './use-value-editor-state';
import { type ColumnServices, createColumnsType } from './value-columns';

interface ValueEditorProps {
  className?: string;
  rows?: number;
  engine: RSEngine;
  value: Value | null;
  type: Typification;
  getHeaderText?: (path: TypePath) => string;
  onChange: (newValue: Value | null) => void;
}

export function ValueEditor({ className, rows, value, engine, getHeaderText, type, onChange }: ValueEditorProps) {
  const {
    path,
    data,
    currentType,
    handleAddElement,
    handleChangeSelected,
    handleDeleteElement,
    handleNavigate,
    handleResetView,
    handleSelectElement,
    typePath,
    selectedBasics,
    selectedCst,
    selectedPath,
    selectedValue
  } = useValueEditorState(engine, value, type, onChange);
  const { filter, setFilter, matcher } = useValueMatcher(engine);

  const showDataText = usePreferencesStore(state => state.showDataText);
  const toggleDataText = usePreferencesStore(state => state.toggleShowDataText);

  const typeStr = printTypeCrumbs(type, typePath);
  const valueStr = describeValue(data, currentType);

  const dataRows =
    data === null ? [] :
      currentType.typeID === TypeID.collection ?
        data as Value[] :
        [data];
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


  const services: ColumnServices = {
    schema: engine.schema!,
    basics: engine.basics,
    matcher: matcher,
    isSingleton: currentType.typeID !== TypeID.collection,
    indexMap: indexMap,
    showDataText,
    navigateValue: handleNavigate,
    getColumnText: subPath => resolveColumnText(path, subPath, type, getHeaderText),
    selectElement: handleSelectElement,
    deleteElement: handleDeleteElement
  };

  const columns = createColumnsType(currentType, selectedPath, services);

  return (
    <div className={cn('relative w-full flex flex-col', className)}>
      <div className='font-math select-none'>{typeStr}</div>
      <div className='flex gap-3'>
        <div className='grow min-w-0'>
          <div className='-mt-1 flex justify-between items-center'>
            <Text
              className='font-math font-normal mr-1 select-none'
              text={valueStr}
              title='Обозначение | Мощность множества'
            />
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
              <MiniButton
                title='Добавить элемент'
                icon={<IconNewItem size='1.25rem' className='icon-green' />}
                onClick={handleAddElement}
                disabled={currentType.typeID !== TypeID.collection && value !== null}
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
              className='cc-scroll-y text-sm select-none border min-w-60'
              enablePagination
              paginationPerPage={20}
              paginationOptions={[20]}
              noDataComponent={
                <NoData>
                  <p>Значение отсутствует</p>
                </NoData>
              }
            />
          </div>
        </div>
        <PickElement
          className='shrink-0 w-60'
          alias={selectedCst?.alias ?? ''}
          term={selectedCst?.term_resolved ?? ''}
          binding={selectedBasics}
          isInteger={selectedValue !== null && selectedCst === null}
          value={selectedValue as number | null}
          onChange={handleChangeSelected}
        />
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