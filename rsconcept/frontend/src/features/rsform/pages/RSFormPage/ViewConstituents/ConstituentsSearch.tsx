'use client';

import { MiniButton } from '@/components/Control';
import { IconChild } from '@/components/Icons';
import { SearchBar } from '@/components/Input';

import { SelectMatchMode } from '../../../pages/RSFormPage/ViewConstituents/SelectMatchMode';
import { useCstSearchStore } from '../../../stores/cstSearch';
import { useRSEdit } from '../RSEditContext';

import { SelectGraphFilter } from './SelectGraphFilter';

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

  const { schema } = useRSEdit();

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
