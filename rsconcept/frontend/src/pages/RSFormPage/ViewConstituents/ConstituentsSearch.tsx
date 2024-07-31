'use client';

import { useLayoutEffect, useMemo, useState } from 'react';

import SelectGraphFilter from '@/components/select/SelectGraphFilter';
import SelectMatchMode from '@/components/select/SelectMatchMode';
import SearchBar from '@/components/ui/SearchBar';
import useLocalStorage from '@/hooks/useLocalStorage';
import { CstMatchMode, DependencyMode } from '@/models/miscellaneous';
import { applyGraphFilter } from '@/models/miscellaneousAPI';
import { ConstituentaID, IConstituenta, IRSForm } from '@/models/rsform';
import { createMockConstituenta, matchConstituenta } from '@/models/rsformAPI';
import { extractGlobals } from '@/models/rslangAPI';
import { storage } from '@/utils/constants';

interface ConstituentsSearchProps {
  schema?: IRSForm;
  dense?: boolean;
  activeID?: ConstituentaID;
  activeExpression: string;
  setFiltered: React.Dispatch<React.SetStateAction<IConstituenta[]>>;
}

function ConstituentsSearch({ schema, activeID, activeExpression, dense, setFiltered }: ConstituentsSearchProps) {
  const [filterMatch, setFilterMatch] = useLocalStorage(storage.cstFilterMatch, CstMatchMode.ALL);
  const [filterSource, setFilterSource] = useLocalStorage(storage.cstFilterGraph, DependencyMode.ALL);
  const [filterText, setFilterText] = useState('');

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

  const selectGraph = useMemo(
    () => <SelectGraphFilter value={filterSource} onChange={newValue => setFilterSource(newValue)} dense={dense} />,
    [filterSource, setFilterSource, dense]
  );

  const selectMatchMode = useMemo(
    () => <SelectMatchMode value={filterMatch} onChange={newValue => setFilterMatch(newValue)} dense={dense} />,
    [filterMatch, setFilterMatch, dense]
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
      {selectMatchMode}
      {selectGraph}
    </div>
  );
}

export default ConstituentsSearch;
