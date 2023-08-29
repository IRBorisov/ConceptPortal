import { useCallback, useEffect, useMemo, useState } from 'react';

import ConceptDataTable from '../../../components/Common/ConceptDataTable';
import { useRSForm } from '../../../context/RSFormContext';
import { useConceptTheme } from '../../../context/ThemeContext';
import useLocalStorage from '../../../hooks/useLocalStorage';
import { prefixes } from '../../../utils/constants';
import { applyGraphFilter, CstMatchMode, CstType, DependencyMode, extractGlobals, IConstituenta, matchConstituenta } from '../../../utils/models';
import { getCstDescription, getCstStatusColor, getMockConstituenta } from '../../../utils/staticUI';
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

  const conditionalRowStyles = useMemo(
  () => [
    {
      when: (cst: IConstituenta) => cst.id === activeID,
      style: {
        backgroundColor: colors.selection,
      },
    }
  ], [activeID, colors]);

  const columns = useMemo(
  () => [
    {
      id: 'id',
      selector: (cst: IConstituenta) => cst.id,
      omit: true
    },
    {
      name: 'ID',
      id: 'alias',
      cell: (cst: IConstituenta) => {
        return (<>
          <div
            id={`${prefixes.cst_list}${cst.alias}`}
            className='w-full text-center rounded-md'
            style={{backgroundColor: getCstStatusColor(cst.status, colors)}}
          >
            {cst.alias}
          </div>
          <ConstituentaTooltip data={cst} anchor={`#${prefixes.cst_list}${cst.alias}`} />
        </>);
      },
      width: '65px',
      maxWidth: '65px',
      conditionalCellStyles: [
        {
          when: (cst: IConstituenta) => isMockCst(cst),
          style: {backgroundColor: colors.selectionError}
        }
      ]
    },
    {
      name: 'Описание',
      id: 'description',
      selector: (cst: IConstituenta) => getCstDescription(cst),
      minWidth: '350px',
      wrap: true,
      conditionalCellStyles: [
        {
          when: (cst: IConstituenta) => isMockCst(cst),
          style: {backgroundColor: colors.selectionError}
        }
      ]
    },
    {
      name: 'Выражение',
      id: 'expression',
      selector: (cst: IConstituenta) => cst.definition_formal || '',
      minWidth: '200px',
      hide: 1600,
      grow: 2,
      wrap: true,
      conditionalCellStyles: [
        {
          when: (cst: IConstituenta) => isMockCst(cst),
          style: {backgroundColor: colors.selectionError}
        }
      ]
    }
  ], [colors]);

  const maxHeight = useMemo(
  () => {
    const siblingHeight = `${baseHeight} - ${LOCAL_NAVIGATION_H}`
    return (noNavigation ? 
      `calc(min(100vh - 5.2rem, ${siblingHeight}))`
    : `calc(min(100vh - 8.7rem, ${siblingHeight}))`);
  }, [noNavigation, baseHeight]);

  return (<>
    <div className='sticky top-0 left-0 right-0 z-10 flex items-start justify-between w-full gap-1 px-2 py-1 border-b rounded clr-input clr-border'>
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
    <div className='overflow-y-auto' style={{maxHeight : `${maxHeight}`}}>
      <ConceptDataTable
        data={filteredData}
        columns={columns}
        keyField='id'
        conditionalRowStyles={conditionalRowStyles}
        noDataComponent={
          <span className='flex flex-col justify-center p-2 text-center min-h-[5rem]'>
            <p>Список конституент пуст</p>
            <p>Измените параметры фильтра</p>
          </span>
        }

        striped
        highlightOnHover
        pointerOnHover

        onRowDoubleClicked={handleDoubleClick}
        onRowClicked={handleRowClicked}
        dense
      />
    </div>
  </>);
}

export default ViewSideConstituents;
