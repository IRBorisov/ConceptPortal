import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { ErrorInfo } from '../components/BackendError';
import { matchLibraryItem } from '../models/library';
import { ILibraryItem } from '../models/library';
import { ILibraryFilter } from '../models/miscelanious';
import { IRSFormCreateData, IRSFormData } from '../models/rsform';
import { DataCallback, deleteLibraryItem, getLibrary, getTemplates, postCloneLibraryItem, postNewRSForm } from '../utils/backendAPI';
import { useAuth } from './AuthContext';

interface ILibraryContext {
  items: ILibraryItem[]
  templates: ILibraryItem[]
  loading: boolean
  processing: boolean
  error: ErrorInfo
  setError: (error: ErrorInfo) => void

  applyFilter: (params: ILibraryFilter) => ILibraryItem[]
  createItem: (data: IRSFormCreateData, callback?: DataCallback<ILibraryItem>) => void
  cloneItem: (target: number, data: IRSFormCreateData, callback: DataCallback<IRSFormData>) => void
  destroyItem: (target: number, callback?: () => void) => void
}

const LibraryContext = createContext<ILibraryContext | null>(null)
export const useLibrary = (): ILibraryContext => {
  const context = useContext(LibraryContext);
  if (context === null) {
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
  const [ items, setItems ] = useState<ILibraryItem[]>([])
  const [ templates, setTemplates ] = useState<ILibraryItem[]>([])
  const [ loading, setLoading ] = useState(false);
  const [ processing, setProcessing ] = useState(false);
  const [ error, setError ] = useState<ErrorInfo>(undefined);
  const { user } = useAuth();

  const applyFilter = useCallback(
  (params: ILibraryFilter) => {
    let result = items;
    if (params.is_owned) {
      result = result.filter(item => item.owner === user?.id);
    }
    if (params.is_common !== undefined) {
      result = result.filter(item => item.is_common === params.is_common);
    }
    if (params.is_canonical !== undefined) {
      result = result.filter(item => item.is_canonical === params.is_canonical);
    }
    if (params.is_subscribed !== undefined) {
      result = result.filter(item => user?.subscriptions.includes(item.id));
    }
    if (params.is_personal !== undefined) {
      result = result.filter(item => user?.subscriptions.includes(item.id) || item.owner === user?.id);
    }
    if (params.query) {
      result = result.filter(item => matchLibraryItem(params.query!, item));
    }
    return result;
  }, [items, user]);

  const reload = useCallback(
  (callback?: () => void) => {
    setItems([]);
    setError(undefined);
    getLibrary({
      setLoading: setLoading,
      showError: true,
      onError: error => setError(error),
      onSuccess: newData => {
        setItems(newData);
        if (callback) callback();
      }
    });

    setTemplates([]);
    getTemplates({
      showError: true,
      onSuccess: newData => setTemplates(newData)
    });
  }, []);

  useEffect(() => {
    reload();
  }, [reload, user]);

  const createItem = useCallback(
  (data: IRSFormCreateData, callback?: DataCallback<ILibraryItem>) => {
    setError(undefined);
    postNewRSForm({
      data: data,
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSuccess: newSchema => reload(() => {
        if (user && !user.subscriptions.includes(newSchema.id)) {
          user.subscriptions.push(newSchema.id);
        }
        if (callback) callback(newSchema);
      })
    });
  }, [reload, user]);

  const destroyItem = useCallback(
  (target: number, callback?: () => void) => {
    setError(undefined)
    deleteLibraryItem(String(target), {
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSuccess: () => reload(() => {
        if (user && user.subscriptions.includes(target)) {
          user.subscriptions.splice(user.subscriptions.findIndex(item => item === target), 1);
        }
        if (callback) callback();
      })
    });
  }, [setError, reload, user]);

  const cloneItem = useCallback(
  (target: number, data: IRSFormCreateData, callback: DataCallback<IRSFormData>) => {
    if (!user) {
      return;
    }
    setError(undefined)
    postCloneLibraryItem(String(target), {
      data: data,
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSuccess: newSchema => reload(() => {
        if (user && !user.subscriptions.includes(newSchema.id)) {
          user.subscriptions.push(newSchema.id);
        }
        if (callback) callback(newSchema);
      })
    });
  }, [reload, setError, user]);

  return (
    <LibraryContext.Provider value={{ 
      items, templates, loading, processing, error, setError, 
      applyFilter, createItem, cloneItem, destroyItem
    }}>
      { children }
    </LibraryContext.Provider>
  );
}
