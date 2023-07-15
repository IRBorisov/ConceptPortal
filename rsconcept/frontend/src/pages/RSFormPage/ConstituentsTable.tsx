import { GetErrLabel, GetTypeLabel, IConstituenta, ParsingStatus, ValueClass } from '../../models'
import { useCallback, useMemo, useState } from 'react';
import DataTableThemed, { SelectionInfo } from '../../components/Common/DataTableThemed';
import Button from '../../components/Common/Button';
import { useRSForm } from '../../context/RSFormContext';


interface ConstituentsTableProps {
  onOpenEdit: (cst: IConstituenta) => void
}

function ConstituentsTable({onOpenEdit}: ConstituentsTableProps) {
  const { schema } = useRSForm();
  const [selectedRows, setSelectedRows] = useState<IConstituenta[]>([]);
  const [toggleCleared, setToggleCleared] = useState(false);

  const handleRowSelected = useCallback(
    ({selectedRows} : SelectionInfo<IConstituenta>) => {
		setSelectedRows(selectedRows);
	}, []);

  // const handleClearRows = () => setToggleCleared(!toggleCleared);

  const contextActions = useMemo(() => {
		const handleDelete = () => {
			
			if (window.confirm(`Are you sure you want to delete:\r ${selectedRows.map((cst: IConstituenta) => cst.alias)}?`)) {
				setToggleCleared(!toggleCleared);
				// setData(differenceBy(data, selectedRows, 'title'));
			}
		};

		return (
			<Button text='Удалить' key='delete' onClick={handleDelete} />
		);
	}, [selectedRows, toggleCleared]);
  
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
        cell: (cst: IConstituenta) => <div style={{fontSize: 12}}>{GetErrLabel(cst)}</div>,
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
        name: 'Тип',
        id: 'type',
        cell: (cst: IConstituenta) => <div style={{fontSize: 12}}>{GetTypeLabel(cst)}</div>,
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
        width: '500px',
        minWidth: '200px',
        maxWidth: '500px',
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
        width: '450px',
        minWidth: '200px',
        maxWidth: '450px',
        wrap: true,
        reorder: true,
      },
      {
        name: 'Конвенция / Комментарий',
        id: 'convention',
        cell: (cst: IConstituenta) => <div style={{fontSize: 12}}>{cst.convention || ''}</div>,
        width: '250px',
        minWidth: '0px',
        wrap: true,
        reorder: true,
        hide: 1800,
      },
    ], []
  );

  return (
    <DataTableThemed
      data={schema!.items!}
      columns={columns}
      keyField='id'

      striped
      highlightOnHover
      pointerOnHover
      selectableRows
      selectableRowsNoSelectAll
      
      pagination
      paginationPerPage={100}
      paginationRowsPerPageOptions={[10, 20, 30, 50, 100, 200]}

      clearSelectedRows={toggleCleared}
      contextActions={contextActions}
      onSelectedRowsChange={handleRowSelected}
      onRowDoubleClicked={onOpenEdit}
      dense
    />
);
}

export default ConstituentsTable;
