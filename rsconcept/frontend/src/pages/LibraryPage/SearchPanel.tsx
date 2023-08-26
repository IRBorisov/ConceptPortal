import { useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { MagnifyingGlassIcon } from '../../components/Icons';
import { useAuth } from '../../context/AuthContext';
import { ILibraryFilter } from '../../utils/models';

interface SearchPanelProps {
  filter: ILibraryFilter
  setFilter: React.Dispatch<React.SetStateAction<ILibraryFilter>>
}

function SearchPanel({ filter, setFilter }: SearchPanelProps) {
  const search = useLocation().search;
  const { user } = useAuth();

  const [query, setQuery] = useState('')
  
  useLayoutEffect(() => {
    const filterType = new URLSearchParams(search).get('filter');
    if (filterType === 'common') {
      setQuery('');
      setFilter({
        is_common: true
      });
    } else if (filterType === 'personal' && user) {
      setQuery('');
      setFilter({
        ownedBy: user.id!
      });
    }
  }, [user, search, setQuery, setFilter]);

  return (
    <div className='sticky top-0 left-0 right-0 z-10 flex justify-center w-full border-b clr-bg-pop'>
      <div className='relative w-96'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
          <MagnifyingGlassIcon />
        </div>
        <input
          type='text'
          value={query}
          className='w-full p-2 pl-10 text-sm outline-none clr-bg-pop border-x clr-border'
          placeholder='Поиск схемы...'
          onChange={data => setQuery(data.target.value)}
        />
      </div>
    </div>
  );
}

export default SearchPanel;


{/* <div className='sticky top-0 left-0 right-0 z-10 flex items-start justify-between w-full gap-1 px-2 py-1 bg-white border-b rounded clr-bg-pop clr-border'>
      <MatchModePicker
        value={filterMatch}
        onChange={setFilterMatch}
      />
      <input type='text'
        className='w-full px-2 bg-white outline-none select-none hover:text-clip clr-bg-pop'
        placeholder='наберите текст фильтра'
        value={filterText}
        onChange={event => setFilterText(event.target.value)}
      />
      <DependencyModePicker
        value={filterSource}
        onChange={setFilterSource}
      />
    </div> */}