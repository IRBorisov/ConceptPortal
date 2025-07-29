'use client';

import { MiniButton } from '@/components/control';
import { IconChild, IconCrucial } from '@/components/icons';
import { SearchBar } from '@/components/input';
import { tripleToggleColor } from '@/utils/utils';

import { useCstSearchStore } from '../../stores/cst-search';

import { SelectGraphFilter } from './select-graph-filter';
import { SelectMatchMode } from './select-match-mode';

interface ConstituentsSearchProps {
  dense?: boolean;
  hideGraphFilter?: boolean;
}

export function ConstituentsSearch({ dense, hideGraphFilter }: ConstituentsSearchProps) {
  const query = useCstSearchStore(state => state.query);
  const filterMatch = useCstSearchStore(state => state.match);
  const filterSource = useCstSearchStore(state => state.source);
  const showInherited = useCstSearchStore(state => state.isInherited);
  const showCrucial = useCstSearchStore(state => state.isCrucial);
  const setQuery = useCstSearchStore(state => state.setQuery);
  const setMatch = useCstSearchStore(state => state.setMatch);
  const setSource = useCstSearchStore(state => state.setSource);
  const toggleInherited = useCstSearchStore(state => state.toggleInherited);
  const toggleCrucial = useCstSearchStore(state => state.toggleCrucial);

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

      <MiniButton
        title='Отображение наследников'
        icon={<IconChild size='1rem' className={tripleToggleColor(showInherited)} />}
        className='h-fit self-center'
        onClick={toggleInherited}
      />
      <MiniButton
        title='Отображение ключевых'
        icon={<IconCrucial size='1rem' className={tripleToggleColor(showCrucial)} />}
        className='h-fit self-center'
        onClick={toggleCrucial}
      />
    </div>
  );
}
