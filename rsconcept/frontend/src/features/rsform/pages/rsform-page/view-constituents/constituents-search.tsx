'use client';

import { MiniButton } from '@/components/control1';
import { IconChild } from '@/components/icons1';
import { SearchBar } from '@/components/input1';

import { SelectMatchMode } from './select-match-mode';
import { useCstSearchStore } from '../../../stores/cst-search';
import { useRSEdit } from '../rsedit-context';

import { SelectGraphFilter } from './select-graph-filter';

interface ConstituentsSearchProps {
  dense?: boolean;
}

export function ConstituentsSearch({ dense }: ConstituentsSearchProps) {
  const query = useCstSearchStore(state => state.query);
  const filterMatch = useCstSearchStore(state => state.match);
  const filterSource = useCstSearchStore(state => state.source);
  const includeInherited = useCstSearchStore(state => state.includeInherited);
  const setQuery = useCstSearchStore(state => state.setQuery);
  const setMatch = useCstSearchStore(state => state.setMatch);
  const setSource = useCstSearchStore(state => state.setSource);
  const toggleInherited = useCstSearchStore(state => state.toggleInherited);

  const schema = useRSEdit().schema;

  return (
    <div className='flex border-b clr-input rounded-t-md'>
      <SearchBar
        id='constituents_search'
        noBorder
        className='min-w-24 mr-2 grow'
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
