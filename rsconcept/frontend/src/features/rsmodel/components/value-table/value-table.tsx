'use client';

import { useState } from 'react';

import { TypeID, type Typification, type Value } from '@/features/rslang';

import { MiniButton } from '@/components/control';
import { DataTable } from '@/components/data-table';
import { IconReset } from '@/components/icons';
import { cn } from '@/components/utils';
import { useFitHeight } from '@/stores/app-layout';
import { usePreferencesStore } from '@/stores/preferences';

// import { notImplemented } from '@/utils/utils';
import { type RSEngine } from '../../models/rsengine';
import { IconShowDataText } from '../icon-show-data-text';

import { createColumnsType } from './value-columns';

interface ValueTableProps {
  className?: string;
  engine: RSEngine;
  value: Value;
  type: Typification;
  heightMargin?: string;
  onChange?: (newValue: Value) => void;
}

/** Displays a badge with value cardinality and information tooltip. */
export function ValueTable({ className, heightMargin, value, engine, type, onChange }: ValueTableProps) {
  const [currentValue, setCurrentValue] = useState<Value>(value);
  const [currentType, setCurrentType] = useState<Typification>(type);
  console.log('Edit enabled: ', !!onChange && !!setCurrentType && !!setCurrentValue);

  const showDataText = usePreferencesStore(state => state.showDataText);
  const toggleDataText = usePreferencesStore(state => state.toggleShowDataText);

  const isArray = currentType.typeID === TypeID.collection;
  const adjustedType = isArray ? currentType.base : currentType;

  const tableHeight = useFitHeight(heightMargin ?? '');

  // function handleNavigateValue(target: Value[], index: number = 0) {
  //   console.log('Navigate to: ', target, index);
  //   notImplemented();
  // }

  // function handleEditElement(target: Value, newValue: Value, index: number = 0) {
  //   console.log('Edit element: ', target, newValue, index);
  //   notImplemented();
  // }

  // function handleDeleteElement(target: Value) {
  //   console.log('Delete element: ', target);
  //   notImplemented();
  // }

  function handleResetView() {
    setCurrentValue(value);
    setCurrentType(type);
  }

  const columns = createColumnsType(adjustedType, engine.schema!, engine.basics, showDataText);

  return (
    <div className={cn('relative overflow-auto w-fit', className)}>
      <div className='flex justify-between'>
        <span>Управление</span>
        <div className='flex'>
          <MiniButton
            title='Сбросить вид'
            icon={<IconReset size='1.25rem' className='icon-primary' />}
            onClick={handleResetView}
            disabled={currentType === type}
          />
          <MiniButton
            title='Отображение данных в тексте'
            icon={<IconShowDataText size='1.25rem' className='hover:text-primary' value={showDataText} />}
            onClick={toggleDataText}
          />
        </div>
      </div>
      <DataTable
        dense
        columns={columns}
        style={{ maxHeight: heightMargin ? tableHeight : undefined }}
        className='cc-scroll-y text-sm select-none w-fit border'
        enablePagination
        paginationPerPage={20}
        paginationOptions={[20]}
        data={isArray ? currentValue as Value[] : [currentValue]}
        headPosition='0rem'
      />
    </div>
  );
}
