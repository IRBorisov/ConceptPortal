'use client';

import { useCallback, useLayoutEffect } from 'react';

import ConceptSearch from '@/components/Common/ConceptSearch';
import Dropdown from '@/components/Common/Dropdown';
import DropdownButton from '@/components/Common/DropdownButton';
import SelectorButton from '@/components/Common/SelectorButton';
import { CogIcon, FilterIcon } from '@/components/Icons';
import useDropdown from '@/hooks/useDropdown';
import useLocalStorage from '@/hooks/useLocalStorage';
import { CstMatchMode, DependencyMode } from '@/models/miscelanious';
import { applyGraphFilter } from '@/models/miscelaniousAPI';
import { IConstituenta, IRSForm } from '@/models/rsform';
import { createMockConstituenta, matchConstituenta } from '@/models/rsformAPI';
import { extractGlobals } from '@/models/rslangAPI';
import { prefixes } from '@/utils/constants';
import { describeCstMathchMode, describeCstSource, labelCstMathchMode, labelCstSource } from '@/utils/labels';

interface ConstituentsSearchProps {
  schema?: IRSForm
  activeID?: number
  activeExpression: string
  setFiltered: React.Dispatch<React.SetStateAction<IConstituenta[]>>
}

function ConstituentsSearch({ schema, activeID, activeExpression, setFiltered }: ConstituentsSearchProps) {
  const [filterMatch, setFilterMatch] = useLocalStorage('side-filter-match', CstMatchMode.ALL);
  const [filterText, setFilterText] = useLocalStorage('side-filter-text', '');
  const [filterSource, setFilterSource] = useLocalStorage('side-filter-dependency', DependencyMode.ALL);

  const matchModeMenu = useDropdown();
  const sourceMenu = useDropdown();

  useLayoutEffect(
  () => {
    if (!schema || schema.items.length === 0) {
      setFiltered([]);
      return;
    }
    let result: IConstituenta[] = [];
    if (filterSource === DependencyMode.EXPRESSION) {
      const aliases = extractGlobals(activeExpression);
      result = schema.items.filter((cst) => aliases.has(cst.alias));
      const names = result.map(cst => cst.alias);
      const diff = Array.from(aliases).filter(name => !names.includes(name));
      if (diff.length > 0) {
        diff.forEach(
          (alias, index) => result.push(
            createMockConstituenta(-index, alias, 'Конституента отсутствует')
          )
        );
      }
    } else if (!activeID) {
      result = schema.items;
    } else {
      result = applyGraphFilter(schema, activeID, filterSource);
    }
    if (filterText) {
      result = result.filter(cst => matchConstituenta(cst, filterText, filterMatch));
    }
    setFiltered(result);
  }, [filterText, setFiltered, filterSource, activeExpression, schema?.items, schema, filterMatch, activeID]);

  const handleMatchModeChange = useCallback(
  (newValue: CstMatchMode) => {
    matchModeMenu.hide();
    setFilterMatch(newValue);
  }, [matchModeMenu, setFilterMatch]);

  const handleSourceChange = useCallback(
  (newValue: DependencyMode) => {
    sourceMenu.hide();
    setFilterSource(newValue);
  }, [sourceMenu, setFilterSource]);
  
  return (
  <div className='flex items-stretch border-b clr-input'>
    <ConceptSearch noBorder
      dimensions='min-w-[6rem] pr-2 w-full'
      value={filterText}
      onChange={setFilterText}
    />
   
    <div ref={matchModeMenu.ref}>
      <SelectorButton transparent tabIndex={-1}
        tooltip='Настройка атрибутов для фильтрации'
        dimensions='w-fit h-full'
        icon={<FilterIcon size={5} />}
        text={labelCstMathchMode(filterMatch)}
        onClick={matchModeMenu.toggle}
      />
      {matchModeMenu.isActive ?
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
      </Dropdown> : null}
    </div>

    <div ref={sourceMenu.ref}>
      <SelectorButton transparent tabIndex={-1}
        tooltip='Настройка фильтрации по графу термов'
        dimensions='w-fit h-full pr-2'
        icon={<CogIcon size={4} />}
        text={labelCstSource(filterSource)}
        onClick={sourceMenu.toggle}
      />
      {sourceMenu.isActive ?
      <Dropdown stretchLeft>
        {Object.values(DependencyMode).filter(value => !isNaN(Number(value))).map(
        (value, index) => {
          const source = value as DependencyMode;
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
  </div>);
}

export default ConstituentsSearch;