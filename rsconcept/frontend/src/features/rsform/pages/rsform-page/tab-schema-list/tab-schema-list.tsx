'use client';

import { useState } from 'react';
import clsx from 'clsx';

import { useTx } from '@/i18n';
import { matchConstituenta } from '@/services/search';
import { CstType } from '@rsconcept/domain/library/rsform';

import { useConceptNavigation } from '@/app';
import { MiniSelectorOSS } from '@/features/library/components/mini-selector-oss';

import { ExportDropdown } from '@/components/control/export-dropdown';
import { type DataTableRowDrop, type RowSelectionState } from '@/components/data-table';
import { SearchBar } from '@/components/input';
import { useFitHeight } from '@/stores/app-layout';
import { withPreventDefault } from '@/utils/utils';

import { useSchemaEdit } from '../schema-edit-context';

import { TableSchemaList } from './table-schema-list';
import { ToolbarSchemaList } from './toolbar-schema-list';

export function TabSchemaList() {
  const tx = useTx();
  const router = useConceptNavigation();
  const {
    isContentEditable,
    isProcessing,
    schema,
    selectedCst,
    deselectAll,
    setSelectedCst,
    clearPendingActiveID,
    createCst,
    promptCreateCst,
    moveUp,
    moveDown,
    moveAfter,
    cloneCst,
    promptDeleteSelected
  } = useSchemaEdit();

  const [filterText, setFilterText] = useState('');
  const filtered = filterText ? schema.items.filter(cst => matchConstituenta(cst, filterText)) : schema.items;

  const rowSelection: RowSelectionState = Object.fromEntries(
    filtered.map((cst, index) => [String(index), selectedCst.includes(cst.id)])
  );

  function handleRowSelection(updater: React.SetStateAction<RowSelectionState>) {
    const newRowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
    const newSelection: number[] = [];
    filtered.forEach((cst, index) => {
      if (newRowSelection[String(index)] === true) {
        newSelection.push(cst.id);
      }
    });
    setSelectedCst(prev => [...prev.filter(cst_id => !filtered.find(cst => cst.id === cst_id)), ...newSelection]);
  }

  function handleMoveRows(rows: typeof schema.items, afterID: number | null) {
    const movedIDs = rows.map(cst => cst.id);
    moveAfter(afterID, movedIDs);
  }

  function handleRowsDrop(event: DataTableRowDrop<(typeof schema.items)[number]>) {
    if (event.isClone) {
      void cloneCst({
        cstIDs: event.draggedRows.map(cst => cst.id),
        insertAfter: event.afterRow?.id ?? null
      });
      return;
    }
    handleMoveRows(event.draggedRows, event.afterRow?.id ?? null);
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
      withPreventDefault(promptDeleteSelected)(event);
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

  async function createPDFList() {
    const { cstListToFile } = await import('../../../utils/rsform2pdf');
    return cstListToFile(schema.items);
  }

  function processAltKey(code: string): boolean {
    if (selectedCst.length > 0) {
      // prettier-ignore
      switch (code) {
        case 'ArrowUp': moveUp(); return true;
        case 'ArrowDown': moveDown(); return true;
        case 'KeyV': void cloneCst(); return true;
      }
    }
    // prettier-ignore
    switch (code) {
      case 'Backquote': void promptCreateCst(); return true;

      case 'Digit1': void createCst(CstType.BASE); return true;
      case 'Digit2': void createCst(CstType.STRUCTURED); return true;
      case 'Digit3': void createCst(CstType.TERM); return true;
      case 'Digit4': void createCst(CstType.AXIOM); return true;
      case 'KeyW': void createCst(CstType.FUNCTION); return true;
      case 'KeyE': void createCst(CstType.PREDICATE); return true;
      case 'Digit5': void createCst(CstType.CONSTANT); return true;
      case 'Digit6': void createCst(CstType.STATEMENT); return true;
      case 'Digit7': void createCst(CstType.NOMINAL); return true;
    }
    return false;
  }

  const tableHeight = useFitHeight('4rem + 5px');

  return (
    <div tabIndex={-1} onKeyDown={handleKeyDown} className='relative pt-8'>
      {isContentEditable ? (
        <ToolbarSchemaList
          className={clsx(
            'cc-tab-tools',
            'right-4 lg:right-1/2 -translate-x-1/2 lg:translate-x-0',
            'cc-animate-position',
            'mx-8'
          )}
        />
      ) : null}

      <div className={clsx('flex items-center border-b', !isContentEditable && 'justify-center pl-10')}>
        {isContentEditable ? (
          <div className='px-2'>
            {tx('tx.general.selection.status', {
              selected: selectedCst.length,
              total: schema.items.length
            })}
          </div>
        ) : null}
        {!isContentEditable && schema.oss.length > 0 ? (
          <MiniSelectorOSS
            items={schema.oss}
            onSelect={(event, value) => router.gotoOss(value.id, event.ctrlKey || event.metaKey)}
          />
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
        className='absolute z-pop right-4 hidden sm:block top-9'
        disabled={filtered.length === 0}
        pdfConverter={createPDFList}
      />

      <TableSchemaList
        items={filtered}
        maxHeight={tableHeight}
        enableSelection={isContentEditable}
        selected={rowSelection}
        setSelected={handleRowSelection}
        enableRowReordering={isContentEditable && !isProcessing && schema.items.length > 1}
        onEdit={cstID => {
          clearPendingActiveID();
          router.gotoEditActive(cstID);
        }}
        onCreateNew={() => void promptCreateCst()}
        onMoveRows={handleRowsDrop}
      />
    </div>
  );
}
