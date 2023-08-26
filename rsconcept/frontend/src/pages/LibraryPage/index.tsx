import { useLayoutEffect, useState } from 'react';

import BackendError from '../../components/BackendError'
import { Loader } from '../../components/Common/Loader'
import { useLibrary } from '../../context/LibraryContext';
import { ILibraryFilter, ILibraryItem } from '../../utils/models';
import SearchPanel from './SearchPanel';
import ViewLibrary from './ViewLibrary';

function LibraryPage() {
  const library = useLibrary();
  
  const [ filter, setFilter ] = useState<ILibraryFilter>({});
  const [ items, setItems ] = useState<ILibraryItem[]>([]);
  
  useLayoutEffect(
  () => {
    setItems(library.filter(filter));
  }, [library, filter, filter.query]);

  return (
    <div className='w-full'>
      { library.loading && <Loader /> }
      { library.error && <BackendError error={library.error} />}
      { !library.loading && library.items && 
      <div className='flex flex-col w-full'>
        <SearchPanel 
          setFilter={setFilter}
        />
        <ViewLibrary
          cleanQuery={() => setFilter({})}
          items={items} 
        />
      </div>
      }
    </div>
  );
}

export default LibraryPage;
