import { CstType, IConstituenta, INewCstData, ParsingStatus, ValueClass, inferStatus } from '../../utils/models'
import { useCallback, useMemo, useState } from 'react';
import DataTableThemed from '../../components/Common/DataTableThemed';
import { useRSForm } from '../../context/RSFormContext';
import Button from '../../components/Common/Button';
import { ArrowDownIcon, ArrowUpIcon, ArrowsRotateIcon, DumpBinIcon, SmallPlusIcon } from '../../components/Icons';
import { toast } from 'react-toastify';
import Divider from '../../components/Common/Divider';
import { createAliasFor, getCstTypeLabel, getCstTypePrefix, getStatusInfo, getTypeLabel } from '../../utils/staticUI';
import CreateCstModal from './CreateCstModal';
import { AxiosResponse } from 'axios';

interface ConstituentsTableProps {
  onOpenEdit: (cst: IConstituenta) => void
}

function ConstituentsTable({onOpenEdit}: ConstituentsTableProps) {
  const { schema, isEditable, cstCreate, cstDelete, reload } = useRSForm();
  const [selected, setSelected] = useState<IConstituenta[]>([]);
  const nothingSelected = useMemo(() => selected.length === 0, [selected]);

  const [showCstModal, setShowCstModal] = useState(false);

  const handleRowClicked = useCallback(
    (cst: IConstituenta, event: React.MouseEvent<Element, MouseEvent>) => {
		if (event.altKey) {
      onOpenEdit(cst);
    }
	}, [onOpenEdit]);

  const handleDelete = useCallback(() => {
    if (!window.confirm('Вы уверены, что хотите удалить выбранные конституенты?')) {
      return;
    }
    const data = { 
      'items': selected.map(cst => cst.entityUID)
    }
    const deletedNamed = selected.map(cst => cst.alias)
    cstDelete(data, (response: AxiosResponse) => {
      reload().then(() => toast.success(`Конституенты удалены: ${deletedNamed}`));
    });
  }, [selected, cstDelete, reload]);

  const handleMoveUp = useCallback(() => {
    toast.info('Перемещение вверх');
    
  }, []);

  const handleMoveDown = useCallback(() => {
    toast.info('Перемещение вниз');
  }, []);

  const handleReindex = useCallback(() => {
    toast.info('Переиндексация');
  }, []);
  
  const handleAddNew = useCallback((csttype?: CstType) => {
    if (!csttype) {
      setShowCstModal(true);
    } else {
      let data: INewCstData = { 
        'csttype': csttype,
        'alias': createAliasFor(csttype, schema!)
      }
      if (selected.length > 0) {
        data['insert_after'] = selected[selected.length - 1].entityUID
      }
      cstCreate(data, (response: AxiosResponse) => {
        reload().then(() => toast.success(`Добавлена конституента ${response.data['alias']}`));
      });      
    }
  }, [schema, selected, reload, cstCreate]);
  
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

  return (<>
    <CreateCstModal
      show={showCstModal}
      toggle={() => setShowCstModal(!showCstModal)}
      onCreate={handleAddNew}
    />
    <div className='w-full'>
      <div className='sticky top-[4rem] z-10 flex justify-start w-full gap-1 px-2 py-1 border-y items-center h-[2.2rem] clr-app'>
        <div className='mr-3 whitespace-nowrap'>Выбраны <span className='ml-2'><b>{selected.length}</b> из {schema?.stats?.count_all || 0}</span></div>
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
        onSelectedRowsChange={({selectedRows}) => setSelected(selectedRows)}
        onRowDoubleClicked={onOpenEdit}
        onRowClicked={handleRowClicked}
        dense
      />
    </div>
  </>);
}

export default ConstituentsTable;
