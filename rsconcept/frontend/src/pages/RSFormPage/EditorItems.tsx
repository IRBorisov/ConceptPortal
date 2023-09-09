import { createColumnHelper,RowSelectionState } from '@tanstack/react-table';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import Button from '../../components/Common/Button';
import ConceptTooltip from '../../components/Common/ConceptTooltip';
import DataTable from '../../components/Common/DataTable';
import Divider from '../../components/Common/Divider';
import HelpRSFormItems from '../../components/Help/HelpRSFormItems';
import { ArrowDownIcon, ArrowUpIcon, DumpBinIcon, HelpIcon, MeshIcon, SmallPlusIcon } from '../../components/Icons';
import { useRSForm } from '../../context/RSFormContext';
import { useConceptTheme } from '../../context/ThemeContext';
import { prefixes } from '../../utils/constants';
import { CstType, IConstituenta, ICstCreateData, ICstMovetoData } from '../../utils/models'
import { getCstStatusFgColor, getCstTypePrefix, getCstTypeShortcut, getCstTypificationLabel, mapStatusInfo } from '../../utils/staticUI';

const columnHelper = createColumnHelper<IConstituenta>();

interface EditorItemsProps {
  onOpenEdit: (cstID: number) => void
  onCreateCst: (initial: ICstCreateData, skipDialog?: boolean) => void
  onDeleteCst: (selected: number[], callback: (items: number[]) => void) => void
}

function EditorItems({ onOpenEdit, onCreateCst, onDeleteCst }: EditorItemsProps) {
  const { colors } = useConceptTheme();
  const { schema, isEditable, cstMoveTo, resetAliases } = useRSForm();
  const [selected, setSelected] = useState<number[]>([]);
  const nothingSelected = useMemo(() => selected.length === 0, [selected]);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

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
      items: selected.map(id => ({ id: id })),
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
      items: selected.map(id => ({ id: id })),
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

  // Generate new names for all constituents
  function handleReindex() {
    resetAliases(() => toast.success('Имена конституент обновлены'));
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
    };
    onCreateCst(data, type !== undefined);
  }

  // Implement hotkeys for working with constituents table
  function handleTableKey(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!isEditable) {
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
    if (processAltKey(event.key)) {
      event.preventDefault();
      return;
    }
  }

  function processAltKey(key: string): boolean {
    if (selected.length > 0) {
      switch (key) {
        case 'ArrowUp': handleMoveUp(); return true;
        case 'ArrowDown':  handleMoveDown(); return true;
      }
    }
    switch (key) {
    case '1': handleCreateCst(CstType.BASE); return true;
    case '2': handleCreateCst(CstType.STRUCTURED); return true;
    case '3': handleCreateCst(CstType.TERM); return true;
    case '4': handleCreateCst(CstType.AXIOM); return true;
    case 'q': handleCreateCst(CstType.FUNCTION); return true;
    case 'w': handleCreateCst(CstType.PREDICATE); return true;
    case '5': handleCreateCst(CstType.CONSTANT); return true;
    case '6': handleCreateCst(CstType.THEOREM); return true;
    }
    return false;
  }

  const handleRowClicked = useCallback(
  (cst: IConstituenta, event: React.MouseEvent<Element, MouseEvent>) => {
    if (event.altKey) {
      event.preventDefault();
      onOpenEdit(cst.id);
    }
  }, [onOpenEdit]);

  const handleRowDoubleClicked = useCallback(
  (cst: IConstituenta, event: React.MouseEvent<Element, MouseEvent>) => {
    event.preventDefault();
    onOpenEdit(cst.id);
  }, [onOpenEdit]);
  
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

  const columns = useMemo(
  () => [
    columnHelper.accessor('alias', {
      id: 'alias',
      header: 'Имя',
      size: 65,
      minSize: 65,
      cell: props => {
        const cst = props.row.original;
        const info = mapStatusInfo.get(cst.status);
        return (<>
          <div
            id={`${prefixes.cst_list}${cst.alias}`}
            className='w-full px-1 text-center rounded-md whitespace-nowrap'
            style={{
              borderWidth: "1px", 
              borderColor: getCstStatusFgColor(cst.status, colors), 
              color: getCstStatusFgColor(cst.status, colors), 
              fontWeight: 600,
              backgroundColor: colors.bgInput
            }}
          >
            {cst.alias}
          </div>
          <ConceptTooltip
            anchorSelect={`#${prefixes.cst_list}${cst.alias}`}
            place='right'
          >
            <p><span className='font-semibold'>Статус</span>: {info!.tooltip}</p>
          </ConceptTooltip>
        </>);
      }
    }),
    columnHelper.accessor(cst => getCstTypificationLabel(cst), {
      id: 'type',
      header: 'Типизация',
      size: 175,
      maxSize: 175,
      cell: props => <div style={{ fontSize: 12 }}>{props.getValue()}</div>
    }),
    columnHelper.accessor(cst => cst.term_resolved || cst.term_raw || '', {
      id: 'term',
      header: 'Термин',
      size: 350,
      minSize: 150,
      maxSize: 350
    }),
    columnHelper.accessor('definition_formal', {
      id: 'expression',
      header: 'Формальное определение',
      size: 300,
      minSize: 300,
      maxSize: 500
    }),
    columnHelper.accessor(cst => cst.definition_resolved || cst.definition_raw || '', {
      id: 'definition',
      header: 'Текстовое определение',
      size: 200,
      minSize: 200,
      cell: props => <div style={{ fontSize: 12 }}>{props.getValue()}</div>
    }),
    columnHelper.accessor('convention', {
      id: 'convention',
      header: 'Конвенция / Комментарий',
      minSize: 100,
      maxSize: undefined,
      cell: props => <div style={{ fontSize: 12 }}>{props.getValue()}</div>
    }),
  ], [colors]);

    //   name: 'Типизация',
    //   hide: 1600
    // },
    // {
    //   name: 'Формальное определение',
    //   grow: 2,
    // },
    // {
    //   name: 'Текстовое определение',
    //   grow: 2,
    // },
    // {
    //   name: 'Конвенция / Комментарий',
    //   id: 'convention',
    //   hide: 1800

  return (
    <div className='w-full'>
      <div
        className='sticky top-0 flex justify-start w-full gap-1 px-2 py-1 border-y items-center h-[2.2rem] select-none clr-app'
      >
        <div className='mr-3 whitespace-nowrap'>
          Выбраны
          <span className='ml-2'>
            {selected.length} из {schema?.stats?.count_all ?? 0}
          </span>
        </div>
        <div className='flex items-center justify-start w-full gap-1'>
          <Button
            tooltip='Переместить вверх'
            icon={<ArrowUpIcon size={6}/>}
            disabled={!isEditable || nothingSelected}
            dense
            onClick={handleMoveUp}
          />
          <Button
            tooltip='Переместить вниз'
            icon={<ArrowDownIcon size={6}/>}
            disabled={!isEditable || nothingSelected}
            dense
            onClick={handleMoveDown}
          />
          <Button
            tooltip='Удалить выбранные'
            icon={<DumpBinIcon color={isEditable && !nothingSelected ? 'text-warning' : ''} size={6}/>}
            disabled={!isEditable || nothingSelected}
            dense
            onClick={handleDelete}
          />
          <Divider vertical margins='my-1' />
          <Button
            tooltip='Сбросить имена'
            icon={<MeshIcon color={isEditable ? 'text-primary': ''} size={6}/>}
            dense
            disabled={!isEditable}
            onClick={handleReindex}
          />
          <Button
            tooltip='Новая конституента'
            icon={<SmallPlusIcon color={isEditable ? 'text-success': ''} size={6}/>}
            dense
            disabled={!isEditable}
            onClick={() => handleCreateCst()}
          />
          {(Object.values(CstType)).map(
            (typeStr) => {
              const type = typeStr as CstType;
              return (
              <Button key={type}
                text={getCstTypePrefix(type)}
                tooltip={getCstTypeShortcut(type)}
                dense
                widthClass='w-[1.4rem]'
                disabled={!isEditable}
                tabIndex={-1}
                onClick={() => handleCreateCst(type)}
              />);
          })}
          <div id='items-table-help'>
            <HelpIcon color='text-primary' size={6} />
          </div>
          <ConceptTooltip anchorSelect='#items-table-help' offset={30}>
            <HelpRSFormItems />
          </ConceptTooltip>
        </div>
      </div>
      <div className='w-full h-full text-sm' onKeyDown={handleTableKey}>
      <DataTable
        data={schema?.items ?? []}
        columns={columns}
        state={{
          rowSelection: rowSelection
        }}
        
        enableMultiRowSelection

        onRowDoubleClicked={handleRowDoubleClicked}
        onRowClicked={handleRowClicked}
        onRowSelectionChange={setRowSelection}
        
        noDataComponent={
          <span className='flex flex-col justify-center p-2 text-center'>
            <p>Список пуст</p>
            <p 
              className='cursor-pointer text-primary hover:underline'
              onClick={() => handleCreateCst()}>
              Создать новую конституенту
            </p>
          </span>
        }
        />
      </div>
    </div>
  );
}

export default EditorItems;
