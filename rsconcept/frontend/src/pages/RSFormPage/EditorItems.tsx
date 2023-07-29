import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import Button from '../../components/Common/Button';
import DataTableThemed from '../../components/Common/DataTableThemed';
import Divider from '../../components/Common/Divider';
import { ArrowDownIcon, ArrowsRotateIcon, ArrowUpIcon, DumpBinIcon, SmallPlusIcon } from '../../components/Icons';
import { useRSForm } from '../../context/RSFormContext';
import { useConceptTheme } from '../../context/ThemeContext';
import { CstType, type IConstituenta, type ICstCreateData, ICstMovetoData,inferStatus, ParsingStatus, ValueClass } from '../../utils/models'
import { createAliasFor, getCstTypePrefix, getCstTypeShortcut, getStatusInfo, getTypeLabel } from '../../utils/staticUI';
import DlgCreateCst from './DlgCreateCst';

interface EditorItemsProps {
  onOpenEdit: (cst: IConstituenta) => void
}

function EditorItems({ onOpenEdit }: EditorItemsProps) {
  const {
    schema, isEditable,
    cstCreate, cstDelete, cstMoveTo, resetAliases
  } = useRSForm();
  const { noNavigation } = useConceptTheme();
  const [selected, setSelected] = useState<number[]>([]);
  const nothingSelected = useMemo(() => selected.length === 0, [selected]);

  const [showCstModal, setShowCstModal] = useState(false);
  const [toggledClearRows, setToggledClearRows] = useState(false);

  const handleRowClicked = useCallback(
  (cst: IConstituenta, event: React.MouseEvent<Element, MouseEvent>) => {
    if (event.altKey) {
      onOpenEdit(cst);
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

  // Delete selected constituents
  const handleDelete = useCallback(() => {
    if (!schema?.items || !window.confirm('Вы уверены, что хотите удалить выбранные конституенты?')) {
      return;
    }
    const data = {
      items: selected.map(id => { return { id }; })
    }
    const deletedNames = selected.map(id => schema.items?.find(cst => cst.id === id)?.alias).join(', ');
    cstDelete(data, () => {
      toast.success(`Конституенты удалены: ${deletedNames}`);
      setToggledClearRows(prev => !prev);
    });
  }, [selected, schema?.items, cstDelete]);

  // Move selected cst up
  const handleMoveUp = useCallback(
    () => {
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
      items: selected.map(id => { return { id: id }; }),
      move_to: target
    }
    cstMoveTo(data);
  }, [selected, schema?.items, cstMoveTo]);

  // Move selected cst down
  const handleMoveDown = useCallback(
    () => {
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
      items: selected.map(id => { return { id: id }; }),
      move_to: target
    }
    cstMoveTo(data);
  }, [selected, schema?.items, cstMoveTo]);

  // Generate new names for all constituents
  const handleReindex = useCallback(() => { 
    resetAliases(() => toast.success('Переиндексация конституент успешна'));
  }, [resetAliases]);

  // Add new constituent
  const handleAddNew = useCallback((type?: CstType) => {
    if (!schema) {
      return;
    }
    if (!type) {
      setShowCstModal(true);
    } else {
      const selectedPosition = selected.reduce((prev, cstID) => {
        const position = schema.items.findIndex(cst => cst.id === cstID);
        return Math.max(position, prev);
      }, -1) + 1;
      const data: ICstCreateData = {
        cst_type: type,
        alias: createAliasFor(type, schema),
        insert_after: selectedPosition > 0 ? selectedPosition : null
      }
      cstCreate(data, new_cst => toast.success(`Добавлена конституента ${new_cst.alias}`));
    }
  }, [schema, selected, cstCreate]);

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
    case '1': handleAddNew(CstType.BASE); return true;
    case '2': handleAddNew(CstType.STRUCTURED); return true;
    case '3': handleAddNew(CstType.TERM); return true;
    case '4': handleAddNew(CstType.AXIOM); return true;
    case 'q': handleAddNew(CstType.FUNCTION); return true;
    case 'w': handleAddNew(CstType.PREDICATE); return true;
    case '5': handleAddNew(CstType.CONSTANT); return true;
    case '6': handleAddNew(CstType.THEOREM); return true;
    }
    return false;
  }

  const columns = useMemo(() =>
    [
      {
        name: 'ID',
        id: 'id',
        selector: (cst: IConstituenta) => cst.id,
        omit: true
      },
      {
        name: 'Статус',
        id: 'status',
        cell: (cst: IConstituenta) =>
          <div style={{ fontSize: 12 }}>
            {getStatusInfo(inferStatus(cst.parse?.status, cst.parse?.valueClass)).text}
          </div>,
        width: '80px',
        maxWidth: '80px',
        reorder: true,
        hide: 1280,
        conditionalCellStyles: [
          {
            when: (cst: IConstituenta) => cst.parse?.status !== ParsingStatus.VERIFIED,
            classNames: ['bg-[#ffc9c9]', 'dark:bg-[#592b2b]']
          },
          {
            when: (cst: IConstituenta) => cst.parse?.status === ParsingStatus.VERIFIED && cst.parse?.valueClass === ValueClass.INVALID,
            classNames: ['bg-[#beeefa]', 'dark:bg-[#286675]']
          },
          {
            when: (cst: IConstituenta) => cst.parse?.status === ParsingStatus.VERIFIED && cst.parse?.valueClass === ValueClass.PROPERTY,
            classNames: ['bg-[#a5e9fa]', 'dark:bg-[#36899e]']
          }
        ]
      },
      {
        name: 'Имя',
        id: 'alias',
        selector: (cst: IConstituenta) => cst.alias,
        width: '65px',
        maxWidth: '65px',
        reorder: true,
        conditionalCellStyles: [
          {
            when: (cst: IConstituenta) => cst.parse?.status !== ParsingStatus.VERIFIED,
            classNames: ['bg-[#ff8080]', 'dark:bg-[#800000]']
          },
          {
            when: (cst: IConstituenta) => cst.parse?.status === ParsingStatus.VERIFIED && cst.parse?.valueClass === ValueClass.INVALID,
            classNames: ['bg-[#ffbb80]', 'dark:bg-[#964600]']
          },
          {
            when: (cst: IConstituenta) => cst.parse?.status === ParsingStatus.VERIFIED && cst.parse?.valueClass === ValueClass.PROPERTY,
            classNames: ['bg-[#a5e9fa]', 'dark:bg-[#36899e]']
          }
        ]
      },
      {
        name: 'Тип',
        id: 'type',
        cell: (cst: IConstituenta) => <div style={{ fontSize: 12 }}>{getTypeLabel(cst)}</div>,
        width: '140px',
        minWidth: '100px',
        maxWidth: '140px',
        wrap: true,
        reorder: true,
        hide: 1600
      },
      {
        name: 'Термин',
        id: 'term',
        selector: (cst: IConstituenta) => cst.term?.resolved ?? cst.term?.raw ?? '',
        width: '350px',
        minWidth: '150px',
        maxWidth: '350px',
        wrap: true,
        reorder: true
      },
      {
        name: 'Формальное определение',
        id: 'expression',
        selector: (cst: IConstituenta) => cst.definition?.formal ?? '',
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
            {cst.definition?.text.resolved ?? cst.definition?.text.raw ?? ''}
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
    ], []
  );

  return (<>
    {showCstModal && <DlgCreateCst
      hideWindow={() => { setShowCstModal(false); }}
      onCreate={handleAddNew}
    />}
    <div className='w-full'>
      <div
        className={'flex justify-start w-full gap-1 px-2 py-1 border-y items-center h-[2.2rem] clr-app' +
          (!noNavigation ? ' sticky z-10 top-[4rem]' : ' sticky z-10 top-[0rem]')}
      >
        <div className='mr-3 whitespace-nowrap'>
          Выбраны
          <span className='ml-2'>
            <b>{selected.length}</b> из {schema?.stats?.count_all ?? 0}
          </span>
        </div>
        {isEditable && <div className='flex justify-start w-full gap-1'>
          <Button
            tooltip='Переместить вверх'
            icon={<ArrowUpIcon size={6}/>}
            disabled={nothingSelected}
            dense
            onClick={handleMoveUp}
          />
          <Button
            tooltip='Переместить вниз'
            icon={<ArrowDownIcon size={6}/>}
            disabled={nothingSelected}
            dense
            onClick={handleMoveDown}
          />
          <Button
            tooltip='Удалить выбранные'
            icon={<DumpBinIcon color={!nothingSelected ? 'text-red' : ''} size={6}/>}
            disabled={nothingSelected}
            dense
            onClick={handleDelete}
          />
          <Divider vertical margins='1' />
          <Button
            tooltip='Переиндексировать имена'
            icon={<ArrowsRotateIcon color='text-primary' size={6}/>}
            dense
            onClick={handleReindex}
          />
          <Button
            tooltip='Новая конституента'
            icon={<SmallPlusIcon color='text-green' size={6}/>}
            dense
            onClick={() => { handleAddNew(); }}
          />
          {(Object.values(CstType)).map(
            (typeStr) => {
              const type = typeStr as CstType;
              return <Button key={type}
                text={`${getCstTypePrefix(type)}`}
                tooltip={getCstTypeShortcut(type)}
                dense
                onClick={() => { handleAddNew(type); }}
              />;
          })}
        </div>}
      </div>
      <div className='w-full h-full' 
        onKeyDown={handleTableKey}
        tabIndex={0} 
        title='Горячие клавиши:&#013;Двойной клик / Alt + клик - редактирование конституенты&#013;Alt + вверх/вниз - движение конституент&#013;Delete - удаление выбранных&#013;Alt + 1-6, Q,W - добавление конституент'
      >
      <DataTableThemed
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
        onSelectedRowsChange={handleSelectionChange}
        onRowDoubleClicked={onOpenEdit}
        onRowClicked={handleRowClicked}
        clearSelectedRows={toggledClearRows}
        dense
      />
      </div>
    </div>
  </>);
}

export default EditorItems;