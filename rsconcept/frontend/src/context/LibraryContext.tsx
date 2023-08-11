import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { ErrorInfo } from '../components/BackendError';
import { DataCallback, deleteRSForm, getLibrary, postCloneRSForm, postNewRSForm } from '../utils/backendAPI';
import { ILibraryFilter, IRSFormCreateData, IRSFormData, IRSFormMeta, matchRSFormMeta } from '../utils/models';
import { useAuth } from './AuthContext';

interface ILibraryContext {
  items: IRSFormMeta[]
  loading: boolean
  processing: boolean
  error: ErrorInfo
  setError: (error: ErrorInfo) => void

  filter: (params: ILibraryFilter) => IRSFormMeta[]
  createSchema: (data: IRSFormCreateData, callback?: DataCallback<IRSFormMeta>) => void
  cloneSchema: (target:number, data: IRSFormCreateData, callback: DataCallback<IRSFormData>) => void
  destroySchema: (target: number, callback?: () => void) => void
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

  const destroySchema = useCallback(
  (target: number, callback?: () => void) => {
    setError(undefined)
    deleteRSForm(String(target), {
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSuccess: () => reload(() => {
        if (callback) callback();
      })
    });
  }, [setError, reload]);

  const cloneSchema = useCallback(
  (target: number, data: IRSFormCreateData, callback: DataCallback<IRSFormData>) => {
    if (!user) {
      return;
    }
    setError(undefined)
    postCloneRSForm(String(target), {
      data: data,
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSuccess: newSchema => reload(() => {
        if (callback) callback(newSchema);
      })
    });
  }, [reload, setError, user]);

  return (
    <LibraryContext.Provider value={{ 
      items, loading, processing, error, setError, 
      filter, createSchema, cloneSchema, destroySchema
    }}>
      { children }
    </LibraryContext.Provider>
  );
}
