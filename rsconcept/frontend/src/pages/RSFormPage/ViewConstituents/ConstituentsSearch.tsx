'use client';

import { useCallback, useLayoutEffect, useState } from 'react';
import { BiCog, BiFilterAlt } from 'react-icons/bi';

import Dropdown from '@/components/ui/Dropdown';
import DropdownButton from '@/components/ui/DropdownButton';
import SearchBar from '@/components/ui/SearchBar';
import SelectorButton from '@/components/ui/SelectorButton';
import useDropdown from '@/hooks/useDropdown';
import useLocalStorage from '@/hooks/useLocalStorage';
import { CstMatchMode, DependencyMode } from '@/models/miscellaneous';
import { applyGraphFilter } from '@/models/miscellaneousAPI';
import { ConstituentaID, IConstituenta, IRSForm } from '@/models/rsform';
import { createMockConstituenta, matchConstituenta } from '@/models/rsformAPI';
import { extractGlobals } from '@/models/rslangAPI';
import { prefixes, storage } from '@/utils/constants';
import { describeCstMatchMode, describeCstSource, labelCstMatchMode, labelCstSource } from '@/utils/labels';

interface ConstituentsSearchProps {
  schema?: IRSForm;
  activeID?: ConstituentaID;
  activeExpression: string;
  setFiltered: React.Dispatch<React.SetStateAction<IConstituenta[]>>;
}

function ConstituentsSearch({ schema, activeID, activeExpression, setFiltered }: ConstituentsSearchProps) {
  const [filterMatch, setFilterMatch] = useLocalStorage(storage.cstFilterMatch, CstMatchMode.ALL);
  const [filterSource, setFilterSource] = useLocalStorage(storage.cstFilterGraph, DependencyMode.ALL);
  const [filterText, setFilterText] = useState('');

  const matchModeMenu = useDropdown();
  const sourceMenu = useDropdown();

  useLayoutEffect(() => {
    if (!schema || schema.items.length === 0) {
      setFiltered([]);
      return;
    }
    let result: IConstituenta[] = [];
    if (filterSource === DependencyMode.EXPRESSION) {
      const aliases = extractGlobals(activeExpression);
      result = schema.items.filter(cst => aliases.has(cst.alias));
      const names = result.map(cst => cst.alias);
      const diff = Array.from(aliases).filter(name => !names.includes(name));
      if (diff.length > 0) {
        diff.forEach((alias, index) => result.push(createMockConstituenta(-index, alias, 'Конституента отсутствует')));
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
    },
    [matchModeMenu, setFilterMatch]
  );

  const handleSourceChange = useCallback(
    (newValue: DependencyMode) => {
      sourceMenu.hide();
      setFilterSource(newValue);
    },
    [sourceMenu, setFilterSource]
  );

  return (
    <div className='flex border-b clr-input'>
      <SearchBar
        id='constituents_search'
        noBorder
        className='min-w-[6rem] pr-2 flex-grow'
        value={filterText}
        onChange={setFilterText}
      />

      <div ref={matchModeMenu.ref}>
        <SelectorButton
          transparent
          tabIndex={-1}
          title='Настройка атрибутов для фильтрации'
          hideTitle={matchModeMenu.isOpen}
          className='h-full'
          icon={<BiFilterAlt size='1.25rem' />}
          text={labelCstMatchMode(filterMatch)}
          onClick={matchModeMenu.toggle}
        />
        <Dropdown stretchLeft isOpen={matchModeMenu.isOpen}>
          {Object.values(CstMatchMode)
            .filter(value => !isNaN(Number(value)))
            .map((value, index) => {
              const matchMode = value as CstMatchMode;
              return (
                <DropdownButton
                  className='w-[22rem]'
                  key={`${prefixes.cst_match_mode_list}${index}`}
                  onClick={() => handleMatchModeChange(matchMode)}
                >
                  <p>
                    <b>{labelCstMatchMode(matchMode)}:</b> {describeCstMatchMode(matchMode)}
                  </p>
                </DropdownButton>
              );
            })}
        </Dropdown>
      </div>

      <div ref={sourceMenu.ref}>
        <SelectorButton
          transparent
          tabIndex={-1}
          title='Настройка фильтрации по графу термов'
          hideTitle={sourceMenu.isOpen}
          className='h-full pr-2'
          icon={<BiCog size='1.25rem' />}
          text={labelCstSource(filterSource)}
          onClick={sourceMenu.toggle}
        />
        <Dropdown stretchLeft isOpen={sourceMenu.isOpen}>
          {Object.values(DependencyMode)
            .filter(value => !isNaN(Number(value)))
            .map((value, index) => {
              const source = value as DependencyMode;
              return (
                <DropdownButton
                  className='w-[23rem]'
                  key={`${prefixes.cst_source_list}${index}`}
                  onClick={() => handleSourceChange(source)}
                >
                  <p>
                    <b>{labelCstSource(source)}:</b> {describeCstSource(source)}
                  </p>
                </DropdownButton>
              );
            })}
        </Dropdown>
      </div>
    </div>
  );
}

export default ConstituentsSearch;
