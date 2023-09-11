import { useCallback, useLayoutEffect, useState } from 'react';

import BackendError from '../../components/BackendError'
import { ConceptLoader } from '../../components/Common/ConceptLoader'
import { useLibrary } from '../../context/LibraryContext';
import { useConceptTheme } from '../../context/ThemeContext';
import useLocalStorage from '../../hooks/useLocalStorage';
import { ILibraryItem } from '../../models/library';
import { ILibraryFilter, LibraryFilterStrategy } from '../../models/miscelanious';
import SearchPanel from './SearchPanel';
import ViewLibrary from './ViewLibrary';

function LibraryPage() {
  const library = useLibrary();
  const { setShowScroll } = useConceptTheme();
  
  const [ filter, setFilter ] = useState<ILibraryFilter>({});
  const [ items, setItems ] = useState<ILibraryItem[]>([]);

  const [query, setQuery] = useState('');
  const [strategy, setStrategy] = useLocalStorage<LibraryFilterStrategy>('search_strategy', LibraryFilterStrategy.MANUAL);

  useLayoutEffect(
  () => {
    setShowScroll(true);
    return () => setShowScroll(false);
  }, [setShowScroll]);

  useLayoutEffect(
  () => {
    setItems(library.filter(filter));
  }, [library, filter, filter.query]);

  const resetQuery = useCallback(
  () => {
    setQuery('');
    setStrategy(LibraryFilterStrategy.MANUAL);
    setFilter({});
  }, [setStrategy])

  return (
    <div className='w-full'>
      { library.loading && <ConceptLoader /> }
      { library.error && <BackendError error={library.error} />}
      { !library.loading && library.items && 
      <div className='flex flex-col w-full'>
        <SearchPanel
          query={query}
          setQuery={setQuery}
          strategy={strategy}
          setStrategy={setStrategy}
          total={library.items.length ?? 0}
          filtered={items.length}
          setFilter={setFilter}
        />
        <ViewLibrary
          resetQuery={resetQuery}
          items={items} 
        />
      </div>
      }
    </div>
  );
}

export default LibraryPage;
