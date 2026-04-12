'use client';

import { MiniButton } from '@/components/control';
import { IconChild, IconCrucial, IconGraphCore, IconStatusError } from '@/components/icons';
import { SearchBar } from '@/components/input';
import { tripleToggleColor } from '@/utils/utils';

import { useCstSearchStore } from '../../stores/cst-search';

interface ConstituentsSearchProps {
  hasProblematicFilter?: boolean;
}

export function ConstituentsSearch({ hasProblematicFilter = false }: ConstituentsSearchProps) {
  const query = useCstSearchStore(state => state.query);
  const showInherited = useCstSearchStore(state => state.isInherited);
  const showCrucial = useCstSearchStore(state => state.isCrucial);
  const showKernel = useCstSearchStore(state => state.isKernel);
  const showProblematic = useCstSearchStore(state => state.isProblematic);
  const setQuery = useCstSearchStore(state => state.setQuery);
  const toggleKernel = useCstSearchStore(state => state.toggleKernel);
  const toggleProblematic = useCstSearchStore(state => state.toggleProblematic);
  const toggleInherited = useCstSearchStore(state => state.toggleInherited);
  const toggleCrucial = useCstSearchStore(state => state.toggleCrucial);

  return (
    <div className='flex border-b bg-input rounded-t-md pr-1'>
      <SearchBar
        id='constituents_search'
        noBorder
        className='min-w-24 mr-2 grow'
        query={query}
        onChangeQuery={setQuery}
      />

      {hasProblematicFilter ? (
        <MiniButton
          title='Фильтр: проблемные понятия'
          icon={<IconStatusError size='1rem' className={showProblematic ? 'text-destructive' : ''} />}
          className='h-fit self-center'
          onClick={toggleProblematic}
        />
      ) : null}
      <MiniButton
        title='Фильтр: неопределяемые понятия'
        icon={<IconGraphCore size='1rem' className={showKernel ? 'text-constructive' : ''} />}
        className='h-fit self-center'
        onClick={toggleKernel}
      />
      <MiniButton
        title='Фильтр: наследники'
        icon={<IconChild size='1rem' className={tripleToggleColor(showInherited)} />}
        className='h-fit self-center'
        onClick={toggleInherited}
      />
      <MiniButton
        title='Фильтр: ключевые'
        icon={<IconCrucial size='1rem' className={tripleToggleColor(showCrucial)} />}
        className='h-fit self-center'
        onClick={toggleCrucial}
      />
    </div>
  );
}
