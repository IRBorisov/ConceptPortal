'use client';

import { useState } from 'react';
import clsx from 'clsx';

import { useConceptNavigation } from '@/app';
import { MiniSelectorOSS } from '@/features/library/components/mini-selector-oss';
import { CstType } from '@/features/rsform/models/rsform';

import { ExportDropdown } from '@/components/control/export-dropdown';
import { type RowSelectionState } from '@/components/data-table';
import { SearchBar } from '@/components/input';
import { useFitHeight } from '@/stores/app-layout';
import { withPreventDefault } from '@/utils/utils';

import { useMutatingRSForm } from '../../../backend/use-mutating-rsform';
import { matchConstituenta } from '../../../models/rsform-api';
import { CstMatchMode } from '../../../stores/cst-search';
import { useRSEdit } from '../rsedit-context';

import { TableRSList } from './table-rslist';
import { ToolbarRSList } from './toolbar-rslist';

export function EditorRSList() {
  const router = useConceptNavigation();
  const isProcessing = useMutatingRSForm();
  const {
    isContentEditable,
    schema,
    selectedCst,
    deselectAll,
    setSelectedCst,
    createCst,
    promptCreateCst,
    moveUp,
    moveDown,
    cloneCst,
    promptDeleteSelected,
  } = useRSEdit();

  const [filterText, setFilterText] = useState('');
  const filtered = filterText
    ? schema.items.filter(cst => matchConstituenta(cst, filterText, CstMatchMode.ALL))
    : schema.items;

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
      case 'KeyQ': void createCst(CstType.FUNCTION); return true;
      case 'KeyW': void createCst(CstType.PREDICATE); return true;
      case 'Digit5': void createCst(CstType.CONSTANT); return true;
      case 'Digit6': void createCst(CstType.THEOREM); return true;
      case 'Digit7': void createCst(CstType.NOMINAL); return true;
    }
    return false;
  }

  const tableHeight = useFitHeight('4rem + 5px');

  return (
    <div tabIndex={-1} onKeyDown={handleKeyDown} className='relative pt-8'>
      {isContentEditable ? (
        <ToolbarRSList className='cc-tab-tools right-4 md:right-1/2 -translate-x-1/2 md:translate-x-0 cc-animate-position' />
      ) : null}

      <div className={clsx('flex items-center border-b', !isContentEditable && 'justify-center pl-10')}>
        {isContentEditable ? (
          <div className='px-2'>
            Выбор {selectedCst.length} из {schema.items.length}
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
        className='absolute z-pop right-4 hidden sm:block top-18'
        disabled={filtered.length === 0}
        pdfConverter={createPDFList}
      />

      <TableRSList
        items={filtered}
        maxHeight={tableHeight}
        enableSelection={isContentEditable}
        selected={rowSelection}
        setSelected={handleRowSelection}
        onEdit={cstID => router.gotoEditActive(cstID)}
        onCreateNew={() => void promptCreateCst()}
      />
    </div>
  );
}
