'use client';

import clsx from 'clsx';
import { useLayoutEffect, useMemo, useState } from 'react';

import SelectedCounter from '@/components/info/SelectedCounter';
import { type RowSelectionState } from '@/components/ui/DataTable';
import AnimateFade from '@/components/wrap/AnimateFade';
import { useConceptOptions } from '@/context/OptionsContext';
import { ConstituentaID, CstType } from '@/models/rsform';

import { useRSEdit } from '../RSEditContext';
import RSListToolbar from './RSListToolbar';
import RSTable from './RSTable';

interface EditorRSListProps {
  onOpenEdit: (cstID: ConstituentaID) => void;
}

function EditorRSList({ onOpenEdit }: EditorRSListProps) {
  const { calculateHeight } = useConceptOptions();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const controller = useRSEdit();

  useLayoutEffect(() => {
    if (!controller.schema || controller.selected.length === 0) {
      setRowSelection({});
    } else {
      const newRowSelection: RowSelectionState = {};
      controller.schema.items.forEach((cst, index) => {
        newRowSelection[String(index)] = controller.selected.includes(cst.id);
      });
      setRowSelection(newRowSelection);
    }
  }, [controller.selected, controller.schema]);

  function handleRowSelection(updater: React.SetStateAction<RowSelectionState>) {
    if (!controller.schema) {
      controller.deselectAll();
    } else {
      const newRowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
      const newSelection: ConstituentaID[] = [];
      controller.schema.items.forEach((cst, index) => {
        if (newRowSelection[String(index)] === true) {
          newSelection.push(cst.id);
        }
      });
      controller.setSelected(newSelection);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!controller.isContentEditable || controller.isProcessing) {
      return;
    }
    if (event.key === 'Delete' && controller.selected.length > 0) {
      event.preventDefault();
      controller.deleteCst();
      return;
    }
    if (!event.altKey || event.shiftKey) {
      return;
    }
    if (processAltKey(event.code)) {
      event.preventDefault();
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
      {controller.isContentEditable ? <RSListToolbar /> : null}
      <AnimateFade tabIndex={-1} className='outline-none' onKeyDown={handleKeyDown}>
        {controller.isContentEditable ? (
          <SelectedCounter
            totalCount={controller.schema?.stats?.count_all ?? 0}
            selectedCount={controller.selected.length}
            position='top-[0.3rem] left-2'
          />
        ) : null}

        <div
          className={clsx('border-b', {
            'pt-[2.3rem]': controller.isContentEditable,
            'relative top-[-1px]': !controller.isContentEditable
          })}
        />

        <RSTable
          items={controller.schema?.items}
          maxHeight={tableHeight}
          enableSelection={controller.isContentEditable}
          selected={rowSelection}
          setSelected={handleRowSelection}
          onEdit={onOpenEdit}
          onCreateNew={() => controller.createCst(undefined, false)}
        />
      </AnimateFade>
    </>
  );
}

export default EditorRSList;
