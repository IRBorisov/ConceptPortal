'use client';

import { useEffect } from 'react';

import { MiniButton } from '@/components/Control';
import { IconChild } from '@/components/Icons';
import { SearchBar } from '@/components/Input';

import { type IConstituenta, type IRSForm } from '../../../models/rsform';
import { matchConstituenta } from '../../../models/rsformAPI';
import { SelectMatchMode } from '../../../pages/RSFormPage/ViewConstituents/SelectMatchMode';
import { DependencyMode, useCstSearchStore } from '../../../stores/cstSearch';

import { SelectGraphFilter } from './SelectGraphFilter';

interface ConstituentsSearchProps {
  schema: IRSForm;
  dense?: boolean;
  activeID?: number;

  onChange: (newValue: IConstituenta[]) => void;
}

export function ConstituentsSearch({ schema, activeID, dense, onChange }: ConstituentsSearchProps) {
  const query = useCstSearchStore(state => state.query);
  const filterMatch = useCstSearchStore(state => state.match);
  const filterSource = useCstSearchStore(state => state.source);
  const includeInherited = useCstSearchStore(state => state.includeInherited);
  const setQuery = useCstSearchStore(state => state.setQuery);
  const setMatch = useCstSearchStore(state => state.setMatch);
  const setSource = useCstSearchStore(state => state.setSource);
  const toggleInherited = useCstSearchStore(state => state.toggleInherited);

  const graphFiltered = activeID ? applyGraphQuery(schema, activeID, filterSource) : schema.items;
  const queryFiltered = query ? graphFiltered.filter(cst => matchConstituenta(cst, query, filterMatch)) : graphFiltered;
  const inheritanceFiltered = !includeInherited ? queryFiltered.filter(cst => !cst.is_inherited) : queryFiltered;

  useEffect(() => {
    onChange(inheritanceFiltered);
  }, [inheritanceFiltered, onChange]);

  return (
    <div className='flex border-b clr-input rounded-t-md'>
      <SearchBar
        id='constituents_search'
        noBorder
        className='min-w-[6rem] w-[6rem] mr-2 grow'
        query={query}
        onChangeQuery={setQuery}
      />
      <SelectMatchMode value={filterMatch} onChange={setMatch} dense={dense} />
      <SelectGraphFilter value={filterSource} onChange={setSource} dense={dense} />
      {schema.stats.count_inherited > 0 ? (
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

// ====== Internals =========
/**
 * Filter list of  {@link ILibraryItem} to a given graph query.
 */
function applyGraphQuery(target: IRSForm, pivot: number, mode: DependencyMode): IConstituenta[] {
  if (mode === DependencyMode.ALL) {
    return target.items;
  }
  const ids = (() => {
    switch (mode) {
      case DependencyMode.OUTPUTS: {
        return target.graph.nodes.get(pivot)?.outputs;
      }
      case DependencyMode.INPUTS: {
        return target.graph.nodes.get(pivot)?.inputs;
      }
      case DependencyMode.EXPAND_OUTPUTS: {
        return target.graph.expandAllOutputs([pivot]);
      }
      case DependencyMode.EXPAND_INPUTS: {
        return target.graph.expandAllInputs([pivot]);
      }
    }
  })();
  if (ids) {
    return target.items.filter(cst => ids.find(id => id === cst.id));
  } else {
    return target.items;
  }
}
