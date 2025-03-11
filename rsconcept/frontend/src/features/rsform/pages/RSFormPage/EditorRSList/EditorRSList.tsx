'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import fileDownload from 'js-file-download';

import { MiniButton } from '@/components/Control';
import { type RowSelectionState } from '@/components/DataTable';
import { IconCSV } from '@/components/Icons';
import { SearchBar } from '@/components/Input';
import { useFitHeight } from '@/stores/appLayout';
import { infoMsg } from '@/utils/labels';
import { convertToCSV } from '@/utils/utils';

import { CstType } from '../../../backend/types';
import { useMutatingRSForm } from '../../../backend/useMutatingRSForm';
import { matchConstituenta } from '../../../models/rsformAPI';
import { CstMatchMode } from '../../../stores/cstSearch';
import { useRSEdit } from '../RSEditContext';

import { TableRSList } from './TableRSList';
import { ToolbarRSList } from './ToolbarRSList';

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
    canDeleteSelected,
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

  function handleDownloadCSV() {
    if (filtered.length === 0) {
      toast.error(infoMsg.noDataToExport);
      return;
    }
    const blob = convertToCSV(filtered);
    try {
      fileDownload(blob, `${schema.alias}.csv`, 'text/csv;charset=utf-8;');
    } catch (error) {
      console.error(error);
    }
  }

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
      event.preventDefault();
      event.stopPropagation();
      deselectAll();
      return;
    }
    if (!isContentEditable || isProcessing) {
      return;
    }
    if (event.key === 'Delete' && canDeleteSelected) {
      event.preventDefault();
      event.stopPropagation();
      promptDeleteCst();
      return;
    }
    if (!event.altKey || event.shiftKey) {
      return;
    }
    if (processAltKey(event.code)) {
      event.preventDefault();
      event.stopPropagation();
      return;
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
    <div tabIndex={-1} onKeyDown={handleKeyDown} className='relative cc-fade-in pt-8'>
      {isContentEditable ? (
        <ToolbarRSList className='cc-tab-tools right-4 md:right-1/2 -translate-x-1/2 md:translate-x-0 cc-animate-position' />
      ) : null}
      {isContentEditable ? (
        <div className='flex items-center border-b'>
          <div className='px-2'>
            Выбор {selected.length} из {schema.stats?.count_all}
          </div>
          <SearchBar
            id='constituents_search'
            noBorder
            className='w-32'
            query={filterText}
            onChangeQuery={setFilterText}
          />
        </div>
      ) : null}

      <MiniButton
        className='absolute z-pop top-18 right-4'
        title='Выгрузить в формате CSV'
        icon={<IconCSV size='1.25rem' className='icon-green' />}
        onClick={handleDownloadCSV}
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
