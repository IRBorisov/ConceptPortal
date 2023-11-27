import { useCallback, useLayoutEffect, useMemo, useState } from 'react';

import Dropdown from '../../../components/Common/Dropdown';
import DropdownButton from '../../../components/Common/DropdownButton';
import SelectorButton from '../../../components/Common/SelectorButton';
import DataTable, { createColumnHelper, IConditionalStyle, VisibilityState } from '../../../components/DataTable';
import { CogIcon, FilterIcon, MagnifyingGlassIcon } from '../../../components/Icons';
import ConstituentaBadge from '../../../components/Shared/ConstituentaBadge';
import { useRSForm } from '../../../context/RSFormContext';
import { useConceptTheme } from '../../../context/ThemeContext';
import useDropdown from '../../../hooks/useDropdown';
import useLocalStorage from '../../../hooks/useLocalStorage';
import useWindowSize from '../../../hooks/useWindowSize';
import { DependencyMode as CstSource } from '../../../models/miscelanious';
import { CstMatchMode } from '../../../models/miscelanious';
import { applyGraphFilter } from '../../../models/miscelaniousAPI';
import { CstType, IConstituenta } from '../../../models/rsform';
import { createMockConstituenta, isMockCst, matchConstituenta } from '../../../models/rsformAPI';
import { extractGlobals } from '../../../models/rslangAPI';
import { prefixes } from '../../../utils/constants';
import { 
  describeConstituenta, describeCstMathchMode, 
  describeCstSource, labelCstMathchMode, 
  labelCstSource
} from '../../../utils/labels';

// Height that should be left to accomodate navigation panel + bottom margin
const LOCAL_NAVIGATION_H = '2.1rem';

// Window width cutoff for expression show
const COLUMN_EXPRESSION_HIDE_THRESHOLD = 1500;

interface ViewSideConstituentsProps {
  expression: string
  baseHeight: string
  activeID?: number
  onOpenEdit: (cstID: number) => void
}

const columnHelper = createColumnHelper<IConstituenta>();

function ViewSideConstituents({ expression, baseHeight, activeID, onOpenEdit }: ViewSideConstituentsProps) {
  const windowSize = useWindowSize();
  const { noNavigation, colors } = useConceptTheme();
  const { schema } = useRSForm();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({'expression': true})
  
  const [filterMatch, setFilterMatch] = useLocalStorage('side-filter-match', CstMatchMode.ALL);
  const [filterText, setFilterText] = useLocalStorage('side-filter-text', '');
  const [filterSource, setFilterSource] = useLocalStorage('side-filter-dependency', CstSource.ALL);
  
  const [filteredData, setFilteredData] = useState<IConstituenta[]>(schema?.items ?? []);

  const matchModeMenu = useDropdown();
  const sourceMenu = useDropdown();

  useLayoutEffect(
  () => {
    setColumnVisibility(prev => {
      const newValue = (windowSize.width ?? 0) >= COLUMN_EXPRESSION_HIDE_THRESHOLD;
      if (newValue === prev['expression']) {
        return prev;
      } else {
        return {'expression': newValue}
      }
    });
  }, [windowSize]);

  useLayoutEffect(
  () => {
    if (!schema?.items) {
      setFilteredData([]);
      return;
    }
    let filtered: IConstituenta[] = [];
    if (filterSource === CstSource.EXPRESSION) {
      const aliases = extractGlobals(expression);
      filtered = schema.items.filter((cst) => aliases.has(cst.alias));
      const names = filtered.map(cst => cst.alias)
      const diff = Array.from(aliases).filter(name => !names.includes(name));
      if (diff.length > 0) {
        diff.forEach(
          (alias, index) => filtered.push(
            createMockConstituenta(
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
      filtered = filtered.filter(cst => matchConstituenta(cst, filterText, filterMatch));
    }
    setFilteredData(filtered);
  }, [filterText, setFilteredData, filterSource, expression, schema?.items, schema, filterMatch, activeID]);

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

  const handleMatchModeChange = useCallback(
  (newValue: CstMatchMode) => {
    matchModeMenu.hide();
    setFilterMatch(newValue);
  }, [matchModeMenu, setFilterMatch]);

  const handleSourceChange = useCallback(
    (newValue: CstSource) => {
      sourceMenu.hide();
      setFilterSource(newValue);
    }, [sourceMenu, setFilterSource]);

  const columns = useMemo(
  () => [
    columnHelper.accessor('alias', {
      id: 'alias',
      header: 'Имя',
      size: 65,
      minSize: 65,
      footer: undefined,
      cell: props =>
        <ConstituentaBadge 
          theme={colors}
          value={props.row.original}
          prefixID={prefixes.cst_list}
        />
    }),
    columnHelper.accessor(cst => describeConstituenta(cst), {
      id: 'description',
      header: 'Описание',
      size: 1000,
      minSize: 250,
      maxSize: 1000,
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
      size: 2000,
      minSize: 0,
      maxSize: 2000,
      enableHiding: true,
      cell: props => 
        <div style={{
          fontSize: 12,
          color: isMockCst(props.row.original) ? colors.fgWarning : undefined
        }}>
          {props.getValue()}
        </div>
    })
  ], [colors]);

  const conditionalRowStyles = useMemo(
  (): IConditionalStyle<IConstituenta>[] => [
    {
      when: (cst: IConstituenta) => cst.id === activeID,
      style: {
        backgroundColor: colors.bgSelected
      },
    }
  ], [activeID, colors]);

  const maxHeight = useMemo(
  () => {
    const siblingHeight = `${baseHeight} - ${LOCAL_NAVIGATION_H}`
    return (noNavigation ? 
      `calc(min(100vh - 8.2rem, ${siblingHeight}))`
    : `calc(min(100vh - 11.7rem, ${siblingHeight}))`);
  }, [noNavigation, baseHeight]);

  return (<>
    <div className='sticky top-0 left-0 right-0 flex items-stretch justify-between gap-1 pl-2 border-b clr-input'>
      <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-controls'>
        <MagnifyingGlassIcon />
      </div>
      <input type='text'
        className='w-full min-w-[6rem] pr-2 pl-8 py-1 outline-none select-none hover:text-clip clr-input'
        placeholder='Поиск'
        value={filterText}
        onChange={event => setFilterText(event.target.value)}
      />
      <div className='flex'>
        <div ref={matchModeMenu.ref}>
          <SelectorButton transparent tabIndex={-1}
            tooltip='Настройка атрибутов для фильтрации'
            dimensions='w-fit h-full'
            icon={<FilterIcon size={5} />}
            text={labelCstMathchMode(filterMatch)}
            onClick={matchModeMenu.toggle}
          />
          { matchModeMenu.isActive &&
          <Dropdown stretchLeft>
            {Object.values(CstMatchMode).filter(value => !isNaN(Number(value))).map(
            (value, index) => {
              const matchMode = value as CstMatchMode;
              return (
              <DropdownButton
                key={`${prefixes.cst_match_mode_list}${index}`}
                onClick={() => handleMatchModeChange(matchMode)}
              >
                <p><span className='font-semibold'>{labelCstMathchMode(matchMode)}:</span> {describeCstMathchMode(matchMode)}</p>
              </DropdownButton>);
            })}
          </Dropdown>}
        </div>

        <div ref={sourceMenu.ref}>
          <SelectorButton transparent tabIndex={-1}
            tooltip='Настройка фильтрации по графу термов'
            dimensions='w-fit h-full'
            icon={<CogIcon size={4} />}
            text={labelCstSource(filterSource)}
            onClick={sourceMenu.toggle}
          />
          {sourceMenu.isActive ?
          <Dropdown stretchLeft>
            {Object.values(CstSource).filter(value => !isNaN(Number(value))).map(
            (value, index) => {
              const source = value as CstSource;
              return (
              <DropdownButton
                key={`${prefixes.cst_source_list}${index}`}
                onClick={() => handleSourceChange(source)}
              >
                <p><span className='font-semibold'>{labelCstSource(source)}:</span> {describeCstSource(source)}</p>
              </DropdownButton>);
            })}
          </Dropdown> : null}
        </div>
      </div>
    </div>
    <div className='overflow-y-auto text-sm overscroll-none' style={{maxHeight : `${maxHeight}`}}>
      <DataTable dense noFooter
        data={filteredData}
        columns={columns}
        conditionalRowStyles={conditionalRowStyles}
        headPosition='0'

        enableHiding
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}

        noDataComponent={
          <span className='flex flex-col justify-center p-2 text-center min-h-[5rem] select-none'>
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
