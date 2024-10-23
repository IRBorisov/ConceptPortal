'use client';

import { useLayoutEffect, useMemo, useState } from 'react';

import { IconChild } from '@/components/Icons';
import SelectGraphFilter from '@/components/select/SelectGraphFilter';
import SelectMatchMode from '@/components/select/SelectMatchMode';
import MiniButton from '@/components/ui/MiniButton';
import SearchBar from '@/components/ui/SearchBar';
import useLocalStorage from '@/hooks/useLocalStorage';
import { CstMatchMode, DependencyMode } from '@/models/miscellaneous';
import { applyGraphFilter } from '@/models/miscellaneousAPI';
import { ConstituentaID, IConstituenta, IRSForm } from '@/models/rsform';
import { matchConstituenta } from '@/models/rsformAPI';
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
  const [showInherited, setShowInherited] = useLocalStorage(storage.cstFilterShowInherited, true);

  useLayoutEffect(() => {
    if (!schema || schema.items.length === 0) {
      setFiltered([]);
      return;
    }
    let result: IConstituenta[] = [];
    if (!activeID) {
      result = schema.items;
    } else {
      result = applyGraphFilter(schema, activeID, filterSource);
    }
    if (filterText) {
      result = result.filter(cst => matchConstituenta(cst, filterText, filterMatch));
    }
    if (!showInherited) {
      result = result.filter(cst => !cst.is_inherited);
    }
    setFiltered(result);
  }, [
    filterText,
    setFiltered,
    filterSource,
    activeExpression,
    schema?.items,
    schema,
    filterMatch,
    activeID,
    showInherited
  ]);

  const selectGraph = useMemo(
    () => <SelectGraphFilter value={filterSource} onChange={newValue => setFilterSource(newValue)} dense={dense} />,
    [filterSource, setFilterSource, dense]
  );

  const selectMatchMode = useMemo(
    () => <SelectMatchMode value={filterMatch} onChange={newValue => setFilterMatch(newValue)} dense={dense} />,
    [filterMatch, setFilterMatch, dense]
  );

  return (
    <div className='flex border-b clr-input rounded-t-md'>
      <SearchBar
        id='constituents_search'
        noBorder
        className='min-w-[6rem] pr-2 flex-grow'
        value={filterText}
        onChange={setFilterText}
      />
      {selectMatchMode}
      {selectGraph}
      {schema && schema?.stats.count_inherited > 0 ? (
        <MiniButton
          noHover
          titleHtml={`Наследованные: <b>${showInherited ? 'отображать' : 'скрывать'}</b>`}
          icon={<IconChild size='1rem' className={showInherited ? 'icon-primary' : 'clr-text-controls'} />}
          className='h-fit self-center'
          onClick={() => setShowInherited(prev => !prev)}
        />
      ) : null}
    </div>
  );
}

export default ConstituentsSearch;
