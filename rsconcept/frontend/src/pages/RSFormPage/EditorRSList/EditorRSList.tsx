'use client';

import { useLayoutEffect, useState } from 'react';

import { type RowSelectionState } from '@/components/DataTable';
import SelectedCounter from '@/components/Shared/SelectedCounter';
import { useRSForm } from '@/context/RSFormContext';
import { CstType, ICstCreateData, ICstMovetoData } from '@/models/rsform';

import RSListToolbar from './RSListToolbar';
import RSTable from './RSTable';

interface EditorRSListProps {
  isMutable: boolean
  onOpenEdit: (cstID: number) => void
  onTemplates: (insertAfter?: number) => void
  onCreateCst: (initial: ICstCreateData, skipDialog?: boolean) => void
  onDeleteCst: (selected: number[], callback: (items: number[]) => void) => void
  onReindex: () => void
}

function EditorRSList({
  isMutable,
  onOpenEdit, onCreateCst, 
  onDeleteCst, onTemplates, onReindex
}: EditorRSListProps) {
  const { schema, cstMoveTo } = useRSForm();
  const [selected, setSelected] = useState<number[]>([]);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  useLayoutEffect(
  () => {
    if (!schema || Object.keys(rowSelection).length === 0) {
      setSelected([]);
    } else {
      const selected: number[] = [];
      schema.items.forEach((cst, index) => {
        if (rowSelection[String(index)] === true) {
          selected.push(cst.id);
        }
      });
      setSelected(selected);
    }
  }, [rowSelection, schema]);

  // Delete selected constituents
  function handleDelete() {
    if (!schema) {
      return;
    }
    onDeleteCst(selected, () => {
      setRowSelection({});
    });
  }

  // Move selected cst up
  function handleMoveUp() {
    if (!schema?.items || selected.length === 0) {
      return;
    }
    const currentIndex = schema.items.reduce((prev, cst, index) => {
      if (!selected.includes(cst.id)) {
        return prev;
      } else if (prev === -1) {
        return index;
      }
      return Math.min(prev, index);
    }, -1);
    const target = Math.max(0, currentIndex - 1) + 1
    const data = {
      items: selected,
      move_to: target
    }
    cstMoveTo(data, () => {
      const newSelection: RowSelectionState = {};
      selected.forEach((_, index) => {
        newSelection[String(target + index - 1)] = true;
      })
      setRowSelection(newSelection);
    });
  }

  // Move selected cst down
  function handleMoveDown() {
    if (!schema?.items || selected.length === 0) {
      return;
    }
    let count = 0;
    const currentIndex = schema.items.reduce((prev, cst, index) => {
      if (!selected.includes(cst.id)) {
        return prev;
      } else {
        count += 1;
        if (prev === -1) {
          return index;
        }
        return Math.max(prev, index);
      }
    }, -1);
    const target = Math.min(schema.items.length - 1, currentIndex - count + 2) + 1
    const data: ICstMovetoData = {
      items: selected,
      move_to: target
    }
    cstMoveTo(data, () => {
      const newSelection: RowSelectionState = {};
      selected.forEach((_, index) => {
        newSelection[String(target + index - 1)] = true;
      })
      setRowSelection(newSelection);
    });
  }

  function handleCreateCst(type?: CstType) {
    if (!schema) {
      return;
    }
    const selectedPosition = selected.reduce((prev, cstID) => {
      const position = schema.items.findIndex(cst => cst.id === cstID);
      return Math.max(position, prev);
    }, -1);
    const insert_where = selectedPosition >= 0 ? schema.items[selectedPosition].id : undefined;
    const data: ICstCreateData = {
      insert_after: insert_where ?? null,
      cst_type: type ?? CstType.BASE,
      alias: '',
      term_raw: '',
      definition_formal: '',
      definition_raw: '',
      convention: '',
      term_forms: []
    };
    onCreateCst(data, type !== undefined);
  }

  // Clone selected
  function handleClone() {
    if (selected.length < 1 || !schema) {
      return;
    }
    const activeCst = schema.items.find(cst => cst.id === selected[0]);
    if (!activeCst) {
      return;
    }
    const data: ICstCreateData = {
      insert_after: activeCst.id,
      cst_type: activeCst.cst_type,
      alias: '',
      term_raw: activeCst.term_raw,
      definition_formal: activeCst.definition_formal,
      definition_raw: activeCst.definition_raw,
      convention: activeCst.convention,
      term_forms: activeCst.term_forms
    };
    onCreateCst(data, true);
  }

  // Implement hotkeys for working with constituents table
  function handleTableKey(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!isMutable) {
      return;
    }
    if (event.key === 'Delete' && selected.length > 0) {
      event.preventDefault();
      handleDelete();
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
    if (selected.length > 0) {
      switch (code) {
        case 'ArrowUp': handleMoveUp(); return true;
        case 'ArrowDown':  handleMoveDown(); return true;
        case 'KeyV':    handleClone(); return true;
      }
    }
    switch (code) {
      case 'Backquote': handleCreateCst(); return true;
      case 'KeyE':      onTemplates(); return true;
      case 'KeyR':      onReindex(); return true;
      
      case 'Digit1':    handleCreateCst(CstType.BASE); return true;
      case 'Digit2':    handleCreateCst(CstType.STRUCTURED); return true;
      case 'Digit3':    handleCreateCst(CstType.TERM); return true;
      case 'Digit4':    handleCreateCst(CstType.AXIOM); return true;
      case 'KeyQ':      handleCreateCst(CstType.FUNCTION); return true;
      case 'KeyW':      handleCreateCst(CstType.PREDICATE); return true;
      case 'Digit5':    handleCreateCst(CstType.CONSTANT); return true;
      case 'Digit6':    handleCreateCst(CstType.THEOREM); return true;
    }
    return false;
  }

  return (
  <div tabIndex={-1}
    className='w-full outline-none'
    onKeyDown={handleTableKey}
  > 
    <RSListToolbar
      selectedCount={selected.length}
      isMutable={isMutable}
      onMoveUp={handleMoveUp}
      onMoveDown={handleMoveDown}
      onClone={handleClone}
      onCreate={handleCreateCst}
      onDelete={handleDelete}
      onTemplates={() => onTemplates(selected.length !== 0 ? selected[selected.length-1] : undefined)}
      onReindex={onReindex}
    />
    <SelectedCounter 
      total={schema?.stats?.count_all ?? 0}
      selected={selected.length}
      position='left-0 top-1'
    />
    
    <div className='pt-[2.3rem] border-b' />

    <RSTable 
      items={schema?.items}
      selected={rowSelection}
      setSelected={setRowSelection}
      onEdit={onOpenEdit}
      onCreateNew={() => handleCreateCst()}
    />
  </div>);
}

export default EditorRSList;