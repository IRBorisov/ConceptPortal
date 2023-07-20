import { useCallback, useState, useMemo, useEffect } from 'react';
import { useRSForm } from '../../context/RSFormContext';
import { IConstituenta, matchConstituenta } from '../../utils/models';
import Checkbox from '../../components/Common/Checkbox';
import DataTableThemed from '../../components/Common/DataTableThemed';
import useLocalStorage from '../../hooks/useLocalStorage';
import { extractGlobals } from '../../utils/staticUI';

interface ConstituentsSideListProps {
  expression: string
}

function ConstituentsSideList({expression}: ConstituentsSideListProps) {
  const { schema, setActive } = useRSForm();
  const [filteredData, setFilteredData] = useState<IConstituenta[]>(schema?.items || []);
  const [filterText, setFilterText] = useLocalStorage('side-filter-text', '')
  const [onlyExpression, setOnlyExpression] = useLocalStorage('side-filter-flag', false);

  useEffect(() => {
    if (!schema?.items) {
      setFilteredData([]);
    } else if (onlyExpression) {
      const aliases: string[] = extractGlobals(expression);
      setFilteredData(schema?.items.filter((cst) => aliases.includes(cst.alias)));
    } else if (!filterText) {
      setFilteredData(schema?.items);
    } else {
      setFilteredData(schema?.items.filter((cst) => matchConstituenta(filterText, cst)));
    }
  }, [filterText, setFilteredData, onlyExpression, expression, schema]);

  const handleRowClicked = useCallback(
    (cst: IConstituenta, event: React.MouseEvent<Element, MouseEvent>) => {
		if (event.ctrlKey) {
      setActive(cst);
    }
	}, [setActive]);

  const handleDoubleClick = useCallback(
    (cst: IConstituenta, event: React.MouseEvent<Element, MouseEvent>) => {
		setActive(cst);
	}, [setActive]);

  const columns = useMemo(() => 
    [
      {
        id: 'id',
        selector: (cst: IConstituenta) => cst.entityUID,
        omit: true,
      },
      {
        name: 'ID',
        id: 'alias',
        selector: (cst: IConstituenta) => cst.alias,
        width: '62px',
        maxWidth: '62px',
      },
      {
        name: 'Описание',
        id: 'description',
        selector: (cst: IConstituenta) => cst.term?.resolved || cst.definition?.text.resolved || cst.definition?.formal || '',
        minWidth: '350px',
        wrap: true,
      },
      {
        name: 'Выражение',
        id: 'expression',
        selector: (cst: IConstituenta) => cst.definition?.formal || '',
        minWidth: '200px',
        hide: 1600,
        grow: 2,
        wrap: true,
      }
    ], []
  );

  return (
    <div className='max-h-[80vh] overflow-y-scroll border flex-grow w-full'>
      <div className='sticky top-0 left-0 right-0 z-40 flex items-center justify-between w-full gap-1 px-2 py-1 bg-white border-b-2 border-gray-400 rounded dark:bg-gray-700 dark:border-gray-300'>
        <div className='w-full'>
          <input type='text'
            className='w-full px-2 outline-none dark:bg-gray-700 hover:text-clip'
            placeholder='текст для фильтрации списка'
            value={filterText}
            onChange={event => setFilterText(event.target.value)}
            disabled={onlyExpression}
          />
        </div>
        <div className='w-fit min-w-[8rem]'>
          <Checkbox
            label='из выражения'
            value={onlyExpression}
            onChange={event => setOnlyExpression(event.target.checked)}
          />
        </div>
      </div>
      <DataTableThemed
        data={filteredData}
        columns={columns}
        keyField='id'
        noContextMenu

        striped
        highlightOnHover
        pointerOnHover

        onRowDoubleClicked={handleDoubleClick}
        onRowClicked={handleRowClicked}
        dense
      />
    </div>
);
}

export default ConstituentsSideList;
