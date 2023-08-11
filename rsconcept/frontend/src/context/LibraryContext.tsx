import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { ErrorInfo } from '../components/BackendError';
import { DataCallback, getLibrary, postNewRSForm } from '../utils/backendAPI';
import { ILibraryFilter, IRSFormCreateData, IRSFormMeta, matchRSFormMeta } from '../utils/models';
import { useAuth } from './AuthContext';

interface ILibraryContext {
  items: IRSFormMeta[]
  loading: boolean
  processing: boolean
  error: ErrorInfo
  setError: (error: ErrorInfo) => void

  reload: (callback?: () => void) => void
  filter: (params: ILibraryFilter) => IRSFormMeta[]
  createSchema: (data: IRSFormCreateData, callback?: DataCallback<IRSFormMeta>) => void
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
  const [ items, setItems ] = useState<IRSFormMeta[]>([])
  const [ loading, setLoading ] = useState(false);
  const [ processing, setProcessing ] = useState(false);
  const [ error, setError ] = useState<ErrorInfo>(undefined);
  const { user } = useAuth();

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
  (callback?: () => void) => {
    setItems([]);
    setError(undefined);
    getLibrary({
      setLoading: setLoading,
      showError: true,
      onError: (error) => setError(error),
      onSuccess: newData => { 
        setItems(newData);
        if (callback) callback();
      }
    });
  }, []);

  useEffect(() => {
    reload();
  }, [reload, user]);

  const createSchema = useCallback(
  (data: IRSFormCreateData, callback?: DataCallback<IRSFormMeta>) => {
    setError(undefined);
    postNewRSForm({
      data: data,
      showError: true,
      setLoading: setProcessing,
      onError: error => { setError(error); },
      onSuccess: newSchema => {
        reload();
        if (callback) callback(newSchema);
      }
    });
  }, [reload]);

  return (
    <LibraryContext.Provider value={{ 
      items, loading, processing, error, setError, 
      reload, filter, createSchema
    }}>
      { children }
    </LibraryContext.Provider>
  );
}
