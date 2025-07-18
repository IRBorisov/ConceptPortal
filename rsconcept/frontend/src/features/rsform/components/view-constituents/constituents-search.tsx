'use client';

import { MiniButton } from '@/components/control';
import { IconChild } from '@/components/icons';
import { SearchBar } from '@/components/input';

import { type IRSForm } from '../../models/rsform';
import { useCstSearchStore } from '../../stores/cst-search';

import { SelectGraphFilter } from './select-graph-filter';
import { SelectMatchMode } from './select-match-mode';

interface ConstituentsSearchProps {
  schema: IRSForm;
  dense?: boolean;
  hideGraphFilter?: boolean;
}

export function ConstituentsSearch({ schema, dense, hideGraphFilter }: ConstituentsSearchProps) {
  const query = useCstSearchStore(state => state.query);
  const filterMatch = useCstSearchStore(state => state.match);
  const filterSource = useCstSearchStore(state => state.source);
  const includeInherited = useCstSearchStore(state => state.includeInherited);
  const setQuery = useCstSearchStore(state => state.setQuery);
  const setMatch = useCstSearchStore(state => state.setMatch);
  const setSource = useCstSearchStore(state => state.setSource);
  const toggleInherited = useCstSearchStore(state => state.toggleInherited);

  return (
    <div className='flex border-b bg-input rounded-t-md'>
      <SearchBar
        id='constituents_search'
        noBorder
        className='min-w-24 mr-2 grow'
        query={query}
        onChangeQuery={setQuery}
      />
      <SelectMatchMode value={filterMatch} onChange={setMatch} dense={dense} />
      {!hideGraphFilter ? <SelectGraphFilter value={filterSource} onChange={setSource} dense={dense} /> : null}
      {schema.stats.count_inherited > 0 ? (
        <MiniButton
          titleHtml={`Наследованные: <b>${includeInherited ? 'отображать' : 'скрывать'}</b>`}
          aria-label={`Отображение наследованных: ${includeInherited ? 'отображать' : 'скрывать'}`}
          icon={<IconChild size='1rem' className={includeInherited ? 'icon-primary' : undefined} />}
          className='h-fit self-center'
          onClick={toggleInherited}
        />
      ) : null}
    </div>
  );
}
