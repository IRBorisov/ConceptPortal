'use client';

import { useState } from 'react';

import { ExportDropdown } from '@/components/control/export-dropdown';
import { type RowSelectionState } from '@/components/data-table';
import { SearchBar } from '@/components/input';
import { useFitHeight } from '@/stores/app-layout';
import { withPreventDefault } from '@/utils/utils';

import { CstType } from '../../../backend/types';
import { useMutatingRSForm } from '../../../backend/use-mutating-rsform';
import { matchConstituenta } from '../../../models/rsform-api';
import { CstMatchMode } from '../../../stores/cst-search';
import { useRSEdit } from '../rsedit-context';

import { TableRSList } from './table-rslist';
import { ToolbarRSList } from './toolbar-rslist';

export function EditorRSList() {
  const isProcessing = useMutatingRSForm();
  const {
    isContentEditable,
    schema,
    selected,
    deselectAll,
    setSelected,
    createCst,
    createCstDefault,
    moveUp,
    moveDown,
    cloneCst,
    promptDeleteCst,
    navigateCst
  } = useRSEdit();

  const [filterText, setFilterText] = useState('');
  const filtered = filterText
    ? schema.items.filter(cst => matchConstituenta(cst, filterText, CstMatchMode.ALL))
    : schema.items;

  const rowSelection: RowSelectionState = Object.fromEntries(
    filtered.map((cst, index) => [String(index), selected.includes(cst.id)])
  );

  function handleRowSelection(updater: React.SetStateAction<RowSelectionState>) {
    const newRowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
    const newSelection: number[] = [];
    filtered.forEach((cst, index) => {
      if (newRowSelection[String(index)] === true) {
        newSelection.push(cst.id);
      }
    });
    setSelected(prev => [...prev.filter(cst_id => !filtered.find(cst => cst.id === cst_id)), ...newSelection]);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      withPreventDefault(deselectAll)(event);
      return;
    }
    if (!isContentEditable || isProcessing) {
      return;
    }
    if (event.key === 'Delete') {
      withPreventDefault(promptDeleteCst)(event);
      return;
    }
    if (event.altKey && !event.shiftKey) {
      if (processAltKey(event.code)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    }
  }

  function processAltKey(code: string): boolean {
    if (selected.length > 0) {
      // prettier-ignore
      switch (code) {
        case 'ArrowUp': moveUp(); return true;
        case 'ArrowDown':  moveDown(); return true;
        case 'KeyV':    cloneCst(); return true;
      }
    }
    // prettier-ignore
    switch (code) {
      case 'Backquote': createCstDefault(); return true;
      
      case 'Digit1':    createCst(CstType.BASE, true); return true;
      case 'Digit2':    createCst(CstType.STRUCTURED, true); return true;
      case 'Digit3':    createCst(CstType.TERM, true); return true;
      case 'Digit4':    createCst(CstType.AXIOM, true); return true;
      case 'KeyQ':      createCst(CstType.FUNCTION, true); return true;
      case 'KeyW':      createCst(CstType.PREDICATE, true); return true;
      case 'Digit5':    createCst(CstType.CONSTANT, true); return true;
      case 'Digit6':    createCst(CstType.THEOREM, true); return true;
    }
    return false;
  }

  const tableHeight = useFitHeight('4rem + 5px');

  return (
    <div tabIndex={-1} onKeyDown={handleKeyDown} className='relative pt-8'>
      {isContentEditable ? (
        <ToolbarRSList className='cc-tab-tools right-4 md:right-1/2 -translate-x-1/2 md:translate-x-0 cc-animate-position' />
      ) : null}

      <div className='flex items-center border-b'>
        {isContentEditable ? (
          <div className='px-2'>
            Выбор {selected.length} из {schema.stats?.count_all}
          </div>
        ) : null}
        <SearchBar
          id='constituents_search'
          noBorder
          className='max-w-50'
          query={filterText}
          onChangeQuery={setFilterText}
        />
      </div>

      <ExportDropdown
        data={filtered}
        filename={schema.alias}
        className='absolute z-pop right-4 hidden sm:block top-18'
        disabled={filtered.length === 0}
      />

      <TableRSList
        items={filtered}
        maxHeight={tableHeight}
        enableSelection={isContentEditable}
        selected={rowSelection}
        setSelected={handleRowSelection}
        onEdit={navigateCst}
        onCreateNew={createCstDefault}
      />
    </div>
  );
}
