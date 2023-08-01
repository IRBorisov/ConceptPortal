import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { ErrorInfo } from '../components/BackendError';
import { getLibrary } from '../utils/backendAPI';
import { ILibraryFilter, IRSFormMeta, matchRSFormMeta } from '../utils/models';

interface ILibraryContext {
  items: IRSFormMeta[]
  loading: boolean
  error: ErrorInfo
  setError: (error: ErrorInfo) => void

  reload: () => void 
  filter: (params: ILibraryFilter) => IRSFormMeta[]
}

const LibraryContext = createContext<ILibraryContext | null>(null)
export const useLibrary = (): ILibraryContext => {
  const context = useContext(LibraryContext);
  if (context == null) {
    throw new Error(
      'useLibrary has to be used within <LibraryState.Provider>'
    );
  }
  return context;
}

interface LibraryStateProps {
  children: React.ReactNode
}

export const LibraryState = ({ children }: LibraryStateProps) => {
  const [items, setItems] = useState<IRSFormMeta[]>([])
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(undefined);

  const filter = useCallback(
  (params: ILibraryFilter) => {
    let result = items;
    if (params.ownedBy) {
      result = result.filter(schema => schema.owner === params.ownedBy);
    }
    if (params.is_common !== undefined) {
      result = result.filter(schema => schema.is_common === params.is_common);
    }
    if (params.queryMeta) {
      result = result.filter(schema => matchRSFormMeta(params.queryMeta!, schema));
    }
    return result;
  }, [items]);

  const reload = useCallback(
  () => {
    setItems([]);
    setError(undefined);
    getLibrary({
      setLoading: setLoading,
      showError: true,
      onError: (error) => setError(error),
      onSuccess: newData => { setItems(newData); }
    });
  }, []);

  useEffect(() => {
    reload();
  }, [reload])

  return (
    <LibraryContext.Provider value={{ 
      items, loading, error, setError, 
      reload, filter
    }}>
      { children }
    </LibraryContext.Provider>
  );
}
