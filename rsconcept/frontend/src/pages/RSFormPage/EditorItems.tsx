import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import Button from '../../components/Common/Button';
import ConceptDataTable from '../../components/Common/ConceptDataTable';
import ConceptTooltip from '../../components/Common/ConceptTooltip';
import Divider from '../../components/Common/Divider';
import HelpRSFormItems from '../../components/Help/HelpRSFormItems';
import { ArrowDownIcon, ArrowUpIcon, DumpBinIcon, HelpIcon, MeshIcon, SmallPlusIcon } from '../../components/Icons';
import { useRSForm } from '../../context/RSFormContext';
import { useConceptTheme } from '../../context/ThemeContext';
import { prefixes } from '../../utils/constants';
import { CstType, IConstituenta, ICstCreateData, ICstMovetoData } from '../../utils/models'
import { getCstStatusColor, getCstTypePrefix, getCstTypeShortcut, getCstTypificationLabel, mapStatusInfo } from '../../utils/staticUI';

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

  const [toggledClearRows, setToggledClearRows] = useState(false);

  // Delete selected constituents
  function handleDelete() {
    if (!schema) {
      return;
    }
    onDeleteCst(selected, () => {
      setToggledClearRows(prev => !prev);
      setSelected([]);
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
      items: selected.map(id => {
        return { id: id };
      }),
      move_to: target
    }
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
    const target = Math.min(schema.items.length - 1, currentIndex - count + 2) + 1
    const data: ICstMovetoData = {
      items: selected.map(id => {
        return { id: id };
      }),
      move_to: target
    }
    cstMoveTo(data);
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
      onOpenEdit(cst.id);
    }
  }, [onOpenEdit]);
  
  const handleSelectionChange = useCallback(
  ({ selectedRows }: {
    allSelected: boolean
    selectedCount: number
    selectedRows: IConstituenta[]
  }) => {
    setSelected(selectedRows.map(cst => cst.id));
  }, [setSelected]);

  const columns = useMemo(
  () => [
    {
      name: 'ID',
      id: 'id',
      selector: (cst: IConstituenta) => cst.id,
      omit: true
    },
    {
      name: 'Имя',
      id: 'alias',
      cell: (cst: IConstituenta) => {
        const info = mapStatusInfo.get(cst.status)!;
        return (<>
          <div
            id={`${prefixes.cst_list}${cst.alias}`}
            className='w-full px-1 text-center rounded-md whitespace-nowrap'
            style={{backgroundColor: getCstStatusColor(cst.status, colors)}}
          >
            {cst.alias}
          </div>
          <ConceptTooltip
            anchorSelect={`#${prefixes.cst_list}${cst.alias}`}
            place='right'
          >
            <p><b>Статус: </b> {info.tooltip}</p>
          </ConceptTooltip>
        </>);
      },
      width: '65px',
      maxWidth: '65px',
      reorder: true,
    },
    {
      name: 'Типизация',
      id: 'type',
      cell: (cst: IConstituenta) => <div style={{ fontSize: 12 }}>{getCstTypificationLabel(cst)}</div>,
      width: '175px',
      maxWidth: '175px',
      wrap: true,
      reorder: true,
      hide: 1600
    },
    {
      name: 'Термин',
      id: 'term',
      selector: (cst: IConstituenta) => cst.term_resolved || cst.term_raw || '',
      width: '350px',
      minWidth: '150px',
      maxWidth: '350px',
      wrap: true,
      reorder: true
    },
    {
      name: 'Формальное определение',
      id: 'expression',
      selector: (cst: IConstituenta) => cst.definition_formal || '',
      minWidth: '300px',
      maxWidth: '500px',
      grow: 2,
      wrap: true,
      reorder: true
    },
    {
      name: 'Текстовое определение',
      id: 'definition',
      cell: (cst: IConstituenta) => (
        <div style={{ fontSize: 12 }}>
          {cst.definition_resolved || cst.definition_raw || ''}
        </div>
      ),
      minWidth: '200px',
      grow: 2,
      wrap: true,
      reorder: true
    },
    {
      name: 'Конвенция / Комментарий',
      id: 'convention',
      cell: (cst: IConstituenta) => <div style={{ fontSize: 12 }}>{cst.convention ?? ''}</div>,
      minWidth: '100px',
      wrap: true,
      reorder: true,
      hide: 1800
    }
  ], [colors]);

  return (
    <div className='w-full'>
      <div
        className='sticky top-0 z-10 flex justify-start w-full gap-1 px-2 py-1 border-y items-center h-[2.2rem] select-none clr-app'
      >
        <div className='mr-3 whitespace-nowrap'>
          Выбраны
          <span className='ml-2'>
            <b>{selected.length}</b> из {schema?.stats?.count_all ?? 0}
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
      <div className='w-full h-full' onKeyDown={handleTableKey}>
      <ConceptDataTable
        data={schema?.items ?? []}
        columns={columns}
        keyField='id'
        noDataComponent={
          <span className='flex flex-col justify-center p-2 text-center'>
            <p>Список пуст</p>
            <p>Создайте новую конституенту</p>
          </span>
        }
        
        striped
        highlightOnHover
        pointerOnHover
        
        selectableRows
        selectableRowsHighlight
        selectableRowsComponentProps={{tabIndex: -1}}
        onSelectedRowsChange={handleSelectionChange}
        onRowDoubleClicked={cst => onOpenEdit(cst.id)}
        onRowClicked={handleRowClicked}
        clearSelectedRows={toggledClearRows}
        dense
        />
      </div>
    </div>
  );
}

export default EditorItems;
