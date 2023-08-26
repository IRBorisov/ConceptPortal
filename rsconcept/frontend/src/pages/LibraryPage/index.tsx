import { useLayoutEffect, useState } from 'react';

import BackendError from '../../components/BackendError'
import { Loader } from '../../components/Common/Loader'
import { useLibrary } from '../../context/LibraryContext';
import { ILibraryFilter, ILibraryItem } from '../../utils/models';
import SearchPanel from './SearchPanel';
import ViewLibrary from './ViewLibrary';

function LibraryPage() {
  const library = useLibrary();
  
  const [ filterParams, setFilterParams ] = useState<ILibraryFilter>({});
  const [ items, setItems ] = useState<ILibraryItem[]>([]);
  
  useLayoutEffect(() => {
    const filter = filterParams;
    setItems(library.filter(filter));
  }, [library, filterParams]);

  return (
    <div className='w-full'>
      { library.loading && <Loader /> }
      { library.error && <BackendError error={library.error} />}
      { !library.loading && library.items && 
      <div className='flex flex-col w-full'>
        <SearchPanel 
          filter={filterParams}
          setFilter={setFilterParams}
        />
        <ViewLibrary
          cleanQuery={() => setFilterParams({})}
          items={items} 
        />
      </div>
      }
    </div>
  );
}

export default LibraryPage;
