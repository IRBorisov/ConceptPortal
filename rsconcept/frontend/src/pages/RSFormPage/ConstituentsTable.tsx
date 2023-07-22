import { CstType, IConstituenta, ParsingStatus, ValueClass, inferStatus } from '../../utils/models'
import { useCallback, useMemo, useState } from 'react';
import DataTableThemed, { SelectionInfo } from '../../components/Common/DataTableThemed';
import { useRSForm } from '../../context/RSFormContext';
import Button from '../../components/Common/Button';
import { ArrowDownIcon, ArrowUpIcon, ArrowsRotateIcon, DumpBinIcon, SmallPlusIcon } from '../../components/Icons';
import { toast } from 'react-toastify';
import Divider from '../../components/Common/Divider';
import { getCstTypeLabel, getCstTypePrefix, getStatusInfo, getTypeLabel } from '../../utils/staticUI';

interface ConstituentsTableProps {
  onOpenEdit: (cst: IConstituenta) => void
}

function ConstituentsTable({onOpenEdit}: ConstituentsTableProps) {
  const { schema, isEditable, } = useRSForm();
  const [selectedRows, setSelectedRows] = useState<IConstituenta[]>([]);
  const nothingSelected = useMemo(() => selectedRows.length === 0, [selectedRows]);

  const handleRowSelected = useCallback(
    ({selectedRows} : SelectionInfo<IConstituenta>) => {
		setSelectedRows(selectedRows);
	}, []);

  const handleRowClicked = useCallback(
    (cst: IConstituenta, event: React.MouseEvent<Element, MouseEvent>) => {
		if (event.altKey) {
      onOpenEdit(cst);
    }
	}, [onOpenEdit]);

  const handleDelete = useCallback(() => {
    toast.info('Удаление конституент');
  }, []);

  const handleMoveUp = useCallback(() => {
    toast.info('Перемещение вверх');
  }, []);

  const handleMoveDown = useCallback(() => {
    toast.info('Перемещение вниз');
  }, []);

  const handleReindex = useCallback(() => {
    toast.info('Переиндексация');
  }, []);
  
  const handleAddNew = useCallback((cstType?: CstType) => {
    toast.info(`Новая конституента ${cstType || 'NEW'}`);
  }, []);
  
  const columns = useMemo(() => 
    [
      {
        name: 'ID',
        id: 'id',
        selector: (cst: IConstituenta) => cst.entityUID,
        omit: true,
      },
      {
        name: 'Статус',
        id: 'status',
        cell: (cst: IConstituenta) => 
          <div style={{fontSize: 12}}>
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
          },
        ],
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
          },
        ],
      },
      {
        name: 'Тип',
        id: 'type',
        cell: (cst: IConstituenta) => <div style={{fontSize: 12}}>{getTypeLabel(cst)}</div>,
        width: '140px',
        minWidth: '100px',
        maxWidth: '140px',
        wrap: true,
        reorder: true,
        hide: 1600,
      },
      {
        name: 'Термин',
        id: 'term',
        selector: (cst: IConstituenta) => cst.term?.resolved || cst.term?.raw || '',
        width: '350px',
        minWidth: '150px',
        maxWidth: '350px',
        wrap: true,
        reorder: true,
      },
      {
        name: 'Формальное определение',
        id: 'expression',
        selector: (cst: IConstituenta) => cst.definition?.formal || '',
        minWidth: '300px',
        maxWidth: '500px',
        grow: 2,
        wrap: true,
        reorder: true,
      },
      {
        name: 'Текстовое определение',
        id: 'definition',
        cell: (cst: IConstituenta) => (
          <div style={{fontSize: 12}}>
            {cst.definition?.text.resolved || cst.definition?.text.raw || ''}
          </div>
        ),
        minWidth: '200px',
        grow: 2,
        wrap: true,
        reorder: true,
      },
      {
        name: 'Конвенция / Комментарий',
        id: 'convention',
        cell: (cst: IConstituenta) => <div style={{fontSize: 12}}>{cst.convention || ''}</div>,
        minWidth: '100px',
        wrap: true,
        reorder: true,
        hide: 1800,
      },
    ], []
  );

  return (
    <div className='w-full'>
      <div className='flex justify-start w-full gap-1 px-2 py-1 border-y items-center h-[2.2rem]'>
        <div className='mr-3 whitespace-nowrap'>Выбраны <span className='ml-2'><b>{selectedRows.length}</b> из {schema?.stats?.count_all || 0}</span></div>
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
            icon={<DumpBinIcon color={!nothingSelected ? 'text-red': ''} size={6}/>}
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
            onClick={() => handleAddNew()}
          />
          {(Object.values(CstType)).map(
            (typeStr) => {
              const type = typeStr as CstType;
              return <Button
                text={`${getCstTypePrefix(type)}`}
                tooltip={getCstTypeLabel(type)}
                dense
                onClick={() =>handleAddNew(type)}
              />;
          })}
        </div>}
      </div>
      <DataTableThemed
        data={schema!.items!}
        columns={columns}
        keyField='id'

        striped
        highlightOnHover
        pointerOnHover

        selectableRows
        // selectableRowSelected={(cst) => selectedRows.indexOf(cst) < -1}
        selectableRowsHighlight
        onSelectedRowsChange={handleRowSelected}
        onRowDoubleClicked={onOpenEdit}
        onRowClicked={handleRowClicked}
        dense
      />
    </div>
);
}

export default ConstituentsTable;
