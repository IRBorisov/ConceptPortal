'use client';

import { useEffect } from 'react';

import { IconChild } from '@/components/Icons';
import SelectGraphFilter from '@/components/select/SelectGraphFilter';
import SelectMatchMode from '@/components/select/SelectMatchMode';
import MiniButton from '@/components/ui/MiniButton';
import SearchBar from '@/components/ui/SearchBar';
import { applyGraphFilter } from '@/models/miscellaneousAPI';
import { ConstituentaID, IConstituenta, IRSForm } from '@/models/rsform';
import { matchConstituenta } from '@/models/rsformAPI';
import { useCstSearchStore } from '@/stores/cstSearch';

interface ConstituentsSearchProps {
  schema?: IRSForm;
  dense?: boolean;
  activeID?: ConstituentaID;
  activeExpression: string;
  setFiltered: React.Dispatch<React.SetStateAction<IConstituenta[]>>;
}

function ConstituentsSearch({ schema, activeID, activeExpression, dense, setFiltered }: ConstituentsSearchProps) {
  const query = useCstSearchStore(state => state.query);
  const filterMatch = useCstSearchStore(state => state.match);
  const filterSource = useCstSearchStore(state => state.source);
  const includeInherited = useCstSearchStore(state => state.includeInherited);
  const setQuery = useCstSearchStore(state => state.setQuery);
  const setMatch = useCstSearchStore(state => state.setMatch);
  const setSource = useCstSearchStore(state => state.setSource);
  const toggleInherited = useCstSearchStore(state => state.toggleInherited);

  useEffect(() => {
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
    if (query) {
      result = result.filter(cst => matchConstituenta(cst, query, filterMatch));
    }
    if (!includeInherited) {
      result = result.filter(cst => !cst.is_inherited);
    }
    setFiltered(result);
  }, [
    query,
    setFiltered,
    filterSource,
    activeExpression,
    schema?.items,
    schema,
    filterMatch,
    activeID,
    includeInherited
  ]);

  return (
    <div className='flex border-b clr-input rounded-t-md'>
      <SearchBar
        id='constituents_search'
        noBorder
        className='min-w-[6rem] w-[6rem] mr-2 flex-grow'
        query={query}
        onChangeQuery={setQuery}
      />
      <SelectMatchMode value={filterMatch} onChange={newValue => setMatch(newValue)} dense={dense} />
      <SelectGraphFilter value={filterSource} onChange={newValue => setSource(newValue)} dense={dense} />
      {schema && schema?.stats.count_inherited > 0 ? (
        <MiniButton
          noHover
          titleHtml={`Наследованные: <b>${includeInherited ? 'отображать' : 'скрывать'}</b>`}
          icon={<IconChild size='1rem' className={includeInherited ? 'icon-primary' : 'clr-text-controls'} />}
          className='h-fit self-center'
          onClick={toggleInherited}
        />
      ) : null}
    </div>
  );
}

export default ConstituentsSearch;
