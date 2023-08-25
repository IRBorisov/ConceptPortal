import { useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import BackendError from '../../components/BackendError'
import { Loader } from '../../components/Common/Loader'
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { useNavSearch } from '../../context/NavSearchContext';
import { ILibraryFilter, ILibraryItem } from '../../utils/models';
import ViewLibrary from './ViewLibrary';

function LibraryPage() {
  const search = useLocation().search;
  const { query, resetQuery: cleanQuery } = useNavSearch();
  const { user } = useAuth();
  const library = useLibrary();
  
  const [ filterParams, setFilterParams ] = useState<ILibraryFilter>({});
  const [ items, setItems ] = useState<ILibraryItem[]>([]);
  
  useLayoutEffect(() => {
    const filterType = new URLSearchParams(search).get('filter');
    if (filterType === 'common') {
      cleanQuery();
      setFilterParams({
        is_common: true
      });
    } else if (filterType === 'personal' && user) {
      cleanQuery();
      setFilterParams({
        ownedBy: user.id!
      });
    }
  }, [user, search, cleanQuery]);

  useLayoutEffect(() => {
    const filter = filterParams;
    filterParams.queryMeta = query ? query: undefined;
    setItems(library.filter(filter));
  }, [query, library, filterParams]);

  return (
    <div className='w-full'>
      { library.loading && <Loader /> }
      { library.error && <BackendError error={library.error} />}
      { !library.loading && library.items && <ViewLibrary items={items} /> }
    </div>
  );
}

export default LibraryPage;
