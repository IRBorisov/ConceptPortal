'use client';

import { useLayoutEffect, useState } from 'react';

import { type RowSelectionState } from '@/components/DataTable';
import SelectedCounter from '@/components/SelectedCounter';
import { useRSForm } from '@/context/RSFormContext';
import { CstType, ICstMovetoData } from '@/models/rsform';

import RSListToolbar from './RSListToolbar';
import RSTable from './RSTable';

interface EditorRSListProps {
  isMutable: boolean;
  selected: number[];
  setSelected: React.Dispatch<React.SetStateAction<number[]>>;
  onOpenEdit: (cstID: number) => void;
  onClone: () => void;
  onCreate: (type?: CstType) => void;
  onDelete: () => void;
}

function EditorRSList({
  selected,
  setSelected,
  isMutable,
  onOpenEdit,
  onClone,
  onCreate,
  onDelete
}: EditorRSListProps) {
  const { schema, cstMoveTo } = useRSForm();

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  useLayoutEffect(() => {
    if (!schema || selected.length === 0) {
      setRowSelection({});
    } else {
      const newRowSelection: RowSelectionState = {};
      schema.items.forEach((cst, index) => {
        newRowSelection[String(index)] = selected.includes(cst.id);
      });
      setRowSelection(newRowSelection);
    }
  }, [selected, schema]);

  function handleRowSelection(updater: React.SetStateAction<RowSelectionState>) {
    if (!schema) {
      setSelected([]);
    } else {
      const newRowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
      const newSelection: number[] = [];
      schema?.items.forEach((cst, index) => {
        if (newRowSelection[String(index)] === true) {
          newSelection.push(cst.id);
        }
      });
      setSelected(newSelection);
    }
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
    const target = Math.max(0, currentIndex - 1) + 1;
    const data = {
      items: selected,
      move_to: target
    };
    cstMoveTo(data);
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
    const target = Math.min(schema.items.length - 1, currentIndex - count + 2) + 1;
    const data: ICstMovetoData = {
      items: selected,
      move_to: target
    };
    cstMoveTo(data);
  }

  // Implement hotkeys for working with constituents table
  function handleTableKey(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!isMutable) {
      return;
    }
    if (event.key === 'Delete' && selected.length > 0) {
      event.preventDefault();
      onDelete();
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
      // prettier-ignore
      switch (code) {
        case 'ArrowUp': handleMoveUp(); return true;
        case 'ArrowDown':  handleMoveDown(); return true;
        case 'KeyV':    onClone(); return true;
      }
    }
    // prettier-ignore
    switch (code) {
      case 'Backquote': onCreate(); return true;
      
      case 'Digit1':    onCreate(CstType.BASE); return true;
      case 'Digit2':    onCreate(CstType.STRUCTURED); return true;
      case 'Digit3':    onCreate(CstType.TERM); return true;
      case 'Digit4':    onCreate(CstType.AXIOM); return true;
      case 'KeyQ':      onCreate(CstType.FUNCTION); return true;
      case 'KeyW':      onCreate(CstType.PREDICATE); return true;
      case 'Digit5':    onCreate(CstType.CONSTANT); return true;
      case 'Digit6':    onCreate(CstType.THEOREM); return true;
    }
    return false;
  }

  return (
    <div tabIndex={-1} className='outline-none' onKeyDown={handleTableKey}>
      <SelectedCounter
        totalCount={schema?.stats?.count_all ?? 0}
        selectedCount={selected.length}
        position='top-[0.3rem] left-2'
      />

      <RSListToolbar
        selectedCount={selected.length}
        isMutable={isMutable}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onClone={onClone}
        onCreate={onCreate}
        onDelete={onDelete}
      />

      <div className='pt-[2.3rem] border-b' />

      <RSTable
        items={schema?.items}
        selected={rowSelection}
        setSelected={handleRowSelection}
        onEdit={onOpenEdit}
        onCreateNew={onCreate}
      />
    </div>
  );
}

export default EditorRSList;
