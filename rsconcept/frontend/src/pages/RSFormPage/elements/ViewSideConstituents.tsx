import { createColumnHelper } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';

import DataTable from '../../../components/Common/DataTable';
import { useRSForm } from '../../../context/RSFormContext';
import { useConceptTheme } from '../../../context/ThemeContext';
import useLocalStorage from '../../../hooks/useLocalStorage';
import { prefixes } from '../../../utils/constants';
import { applyGraphFilter, CstMatchMode, CstType, DependencyMode, extractGlobals, IConstituenta, matchConstituenta } from '../../../utils/models';
import { getCstDescription, getCstStatusFgColor, getMockConstituenta } from '../../../utils/staticUI';
import ConstituentaTooltip from './ConstituentaTooltip';
import DependencyModePicker from './DependencyModePicker';
import MatchModePicker from './MatchModePicker';

// Height that should be left to accomodate navigation panel + bottom margin
const LOCAL_NAVIGATION_H = '2.1rem';

interface ViewSideConstituentsProps {
  expression: string
  baseHeight: string
  activeID?: number
  onOpenEdit: (cstID: number) => void
}

function isMockCst(cst: IConstituenta) {
  return cst.id <= 0;
}

const columnHelper = createColumnHelper<IConstituenta>();

function ViewSideConstituents({ expression, baseHeight, activeID, onOpenEdit }: ViewSideConstituentsProps) {
  const { noNavigation, colors } = useConceptTheme();
  const { schema } = useRSForm();
  
  const [filterMatch, setFilterMatch] = useLocalStorage('side-filter-match', CstMatchMode.ALL);
  const [filterText, setFilterText] = useLocalStorage('side-filter-text', '');
  const [filterSource, setFilterSource] = useLocalStorage('side-filter-dependency', DependencyMode.ALL);
  
  const [filteredData, setFilteredData] = useState<IConstituenta[]>(schema?.items ?? []);

  useEffect(
  () => {
    if (!schema?.items) {
      setFilteredData([]);
      return;
    }
    let filtered: IConstituenta[] = [];
    if (filterSource === DependencyMode.EXPRESSION) {
      const aliases = extractGlobals(expression);
      filtered = schema.items.filter((cst) => aliases.has(cst.alias));
      const names = filtered.map(cst => cst.alias)
      const diff = Array.from(aliases).filter(name => !names.includes(name));
      if (diff.length > 0) {
        diff.forEach(
          (alias, index) => filtered.push(
            getMockConstituenta(
              schema.id,
              -index,
              alias,
              CstType.BASE,
              'Конституента отсутствует'
            )
          )
        );
      }
    } else if (!activeID) {
      filtered = schema.items
    } else {
      filtered = applyGraphFilter(schema, activeID, filterSource);
    }
    if (filterText) {
      filtered = filtered.filter((cst) => matchConstituenta(filterText, cst, filterMatch));
    }
    setFilteredData(filtered);
  }, [filterText, setFilteredData, filterSource, expression, schema, filterMatch, activeID]);

  const handleRowClicked = useCallback(
  (cst: IConstituenta, event: React.MouseEvent<Element, MouseEvent>) => {
    if (event.altKey && !isMockCst(cst)) {
      onOpenEdit(cst.id);
    }
  }, [onOpenEdit]);

  const handleDoubleClick = useCallback(
  (cst: IConstituenta) => {
    if (!isMockCst(cst)) {
      onOpenEdit(cst.id);
    }
  }, [onOpenEdit]);

  const columns = useMemo(
  () => [
    columnHelper.accessor('alias', {
      id: 'alias',
      header: 'Имя',
      size: 65,
      minSize: 65,
      cell: props => {
        const cst = props.row.original;
        return (<>
          <div
            id={`${prefixes.cst_list}${cst.alias}`}
            className='w-full px-1 text-center rounded-md whitespace-nowrap'
            style={{
              borderWidth: '1px', 
              borderColor: getCstStatusFgColor(cst.status, colors), 
              color: getCstStatusFgColor(cst.status, colors), 
              fontWeight: 600,
              backgroundColor: isMockCst(cst) ? colors.bgWarning : colors.bgInput
            }}
          >
            {cst.alias}
          </div>
          <ConstituentaTooltip data={cst} anchor={`#${prefixes.cst_list}${cst.alias}`} />
        </>);
      }
    }),
    columnHelper.accessor(cst => getCstDescription(cst), {
      id: 'description',
      header: 'Описание',
      size: 350,
      minSize: 350,
      maxSize: 350,
      cell: props => 
        <div style={{
          fontSize: 12,
          color: isMockCst(props.row.original) ? colors.fgWarning : undefined
        }}>
          {props.getValue()}
        </div>
    }),
    columnHelper.accessor('definition_formal', {
      id: 'expression',
      header: 'Выражение',
      size: 700,
      minSize: 0,
      maxSize: 700,
      cell: props => 
        <div style={{
          fontSize: 12,
          color: isMockCst(props.row.original) ? colors.fgWarning : undefined
        }}>
          {props.getValue()}
        </div>
    })
  ], [colors]);

  const maxHeight = useMemo(
  () => {
    const siblingHeight = `${baseHeight} - ${LOCAL_NAVIGATION_H}`
    return (noNavigation ? 
      `calc(min(100vh - 5.2rem, ${siblingHeight}))`
    : `calc(min(100vh - 8.7rem, ${siblingHeight}))`);
  }, [noNavigation, baseHeight]);

  return (<>
    <div className='sticky top-0 left-0 right-0 flex items-start justify-between w-full gap-1 px-2 py-1 border-b rounded clr-input'>
      <MatchModePicker
        value={filterMatch}
        onChange={setFilterMatch}
      />
      <input type='text'
        className='w-full px-2 outline-none select-none hover:text-clip clr-input'
        placeholder='наберите текст фильтра'
        value={filterText}
        onChange={event => setFilterText(event.target.value)}
      />
      <DependencyModePicker
        value={filterSource}
        onChange={setFilterSource}
      />
    </div>
    <div className='overflow-y-auto text-sm' style={{maxHeight : `${maxHeight}`}}>
      <DataTable
        data={filteredData}
        columns={columns}

        
        // conditionalRowStyles={conditionalRowStyles}

        noDataComponent={
          <span className='flex flex-col justify-center p-2 text-center min-h-[5rem]'>
            <p>Список конституент пуст</p>
            <p>Измените параметры фильтра</p>
          </span>
        }

        onRowDoubleClicked={handleDoubleClick}
        onRowClicked={handleRowClicked}
      />
    </div>
  </>);
}

export default ViewSideConstituents;
