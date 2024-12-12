'use client';

import fileDownload from 'js-file-download';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { IconCSV } from '@/components/Icons';
import { type RowSelectionState } from '@/components/ui/DataTable';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import SearchBar from '@/components/ui/SearchBar';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { CstMatchMode } from '@/models/miscellaneous';
import { ConstituentaID, CstType, IConstituenta } from '@/models/rsform';
import { matchConstituenta } from '@/models/rsformAPI';
import { information } from '@/utils/labels';
import { convertToCSV } from '@/utils/utils';

import { useRSEdit } from '../RSEditContext';
import TableRSList from './TableRSList';
import ToolbarRSList from './ToolbarRSList';

interface EditorRSListProps {
  onOpenEdit: (cstID: ConstituentaID) => void;
}

function EditorRSList({ onOpenEdit }: EditorRSListProps) {
  const { calculateHeight } = useConceptOptions();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const controller = useRSEdit();

  const [filtered, setFiltered] = useState<IConstituenta[]>(controller.schema?.items ?? []);
  const [filterText, setFilterText] = useState('');

  useLayoutEffect(() => {
    if (filtered.length === 0) {
      setRowSelection({});
      return;
    }
    const newRowSelection: RowSelectionState = {};
    filtered.forEach((cst, index) => {
      newRowSelection[String(index)] = controller.selected.includes(cst.id);
    });
    setRowSelection(newRowSelection);
  }, [filtered, setRowSelection, controller.selected]);

  useLayoutEffect(() => {
    if (!controller.schema || controller.schema.items.length === 0) {
      setFiltered([]);
    } else if (filterText) {
      setFiltered(controller.schema.items.filter(cst => matchConstituenta(cst, filterText, CstMatchMode.ALL)));
    } else {
      setFiltered(controller.schema.items);
    }
  }, [filterText, controller.schema?.items, controller.schema]);

  const handleDownloadCSV = useCallback(() => {
    if (!controller.schema || filtered.length === 0) {
      toast.error(information.noDataToExport);
      return;
    }
    const blob = convertToCSV(filtered);
    try {
      fileDownload(blob, `${controller.schema.alias}.csv`, 'text/csv;charset=utf-8;');
    } catch (error) {
      console.error(error);
    }
  }, [filtered, controller]);

  function handleRowSelection(updater: React.SetStateAction<RowSelectionState>) {
    if (!controller.schema) {
      controller.deselectAll();
    } else {
      const newRowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
      const newSelection: ConstituentaID[] = [];
      filtered.forEach((cst, index) => {
        if (newRowSelection[String(index)] === true) {
          newSelection.push(cst.id);
        }
      });
      controller.setSelected(prev => [
        ...prev.filter(cst_id => !filtered.find(cst => cst.id === cst_id)),
        ...newSelection
      ]);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      controller.deselectAll();
      return;
    }
    if (!controller.isContentEditable || controller.isProcessing) {
      return;
    }
    if (event.key === 'Delete' && controller.canDeleteSelected) {
      event.preventDefault();
      event.stopPropagation();
      controller.promptDeleteCst();
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
    if (controller.selected.length > 0) {
      // prettier-ignore
      switch (code) {
        case 'ArrowUp': controller.moveUp(); return true;
        case 'ArrowDown':  controller.moveDown(); return true;
        case 'KeyV':    controller.cloneCst(); return true;
      }
    }
    // prettier-ignore
    switch (code) {
      case 'Backquote': controller.createCst(undefined, false); return true;
      
      case 'Digit1':    controller.createCst(CstType.BASE, true); return true;
      case 'Digit2':    controller.createCst(CstType.STRUCTURED, true); return true;
      case 'Digit3':    controller.createCst(CstType.TERM, true); return true;
      case 'Digit4':    controller.createCst(CstType.AXIOM, true); return true;
      case 'KeyQ':      controller.createCst(CstType.FUNCTION, true); return true;
      case 'KeyW':      controller.createCst(CstType.PREDICATE, true); return true;
      case 'Digit5':    controller.createCst(CstType.CONSTANT, true); return true;
      case 'Digit6':    controller.createCst(CstType.THEOREM, true); return true;
    }
    return false;
  }

  const tableHeight = useMemo(() => calculateHeight('4.05rem + 5px'), [calculateHeight]);

  return (
    <>
      {controller.isContentEditable ? <ToolbarRSList /> : null}
      <div tabIndex={-1} onKeyDown={handleKeyDown} className='cc-fade-in pt-[1.9rem]'>
        {controller.isContentEditable ? (
          <div className='flex items-center border-b'>
            <div className='px-2'>
              Выбор {controller.selected.length} из {controller.schema?.stats?.count_all ?? 0}
            </div>
            <SearchBar
              id='constituents_search'
              noBorder
              className='w-[8rem]'
              query={filterText}
              onChangeQuery={setFilterText}
            />
          </div>
        ) : null}

        <Overlay position='top-[0.25rem] right-[1rem]' layer='z-tooltip'>
          <MiniButton
            title='Выгрузить в формате CSV'
            icon={<IconCSV size='1.25rem' className='icon-green' />}
            onClick={handleDownloadCSV}
          />
        </Overlay>

        <TableRSList
          items={filtered}
          maxHeight={tableHeight}
          enableSelection={controller.isContentEditable}
          selected={rowSelection}
          setSelected={handleRowSelection}
          onEdit={onOpenEdit}
          onCreateNew={() => controller.createCst(undefined, false)}
        />
      </div>
    </>
  );
}

export default EditorRSList;
