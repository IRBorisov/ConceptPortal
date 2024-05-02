'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import {
  DataCallback,
  deleteLibraryItem,
  getAdminLibrary,
  getLibrary,
  getRSFormDetails,
  getTemplates,
  postCloneLibraryItem,
  postNewRSForm
} from '@/app/backendAPI';
import { ErrorData } from '@/components/info/InfoError';
import { ILibraryItem, LibraryItemID } from '@/models/library';
import { matchLibraryItem } from '@/models/libraryAPI';
import { ILibraryFilter } from '@/models/miscellaneous';
import { IRSForm, IRSFormCloneData, IRSFormCreateData, IRSFormData } from '@/models/rsform';
import { RSFormLoader } from '@/models/RSFormLoader';

import { useAuth } from './AuthContext';
import { useConceptOptions } from './OptionsContext';

interface ILibraryContext {
  items: ILibraryItem[];
  templates: ILibraryItem[];
  loading: boolean;
  processing: boolean;
  error: ErrorData;
  setError: (error: ErrorData) => void;

  applyFilter: (params: ILibraryFilter) => ILibraryItem[];
  retrieveTemplate: (templateID: LibraryItemID, callback: (schema: IRSForm) => void) => void;
  createItem: (data: IRSFormCreateData, callback?: DataCallback<ILibraryItem>) => void;
  cloneItem: (target: LibraryItemID, data: IRSFormCloneData, callback: DataCallback<IRSFormData>) => void;
  destroyItem: (target: LibraryItemID, callback?: () => void) => void;

  localUpdateItem: (data: ILibraryItem) => void;
  localUpdateTimestamp: (target: LibraryItemID) => void;
}

const LibraryContext = createContext<ILibraryContext | null>(null);
export const useLibrary = (): ILibraryContext => {
  const context = useContext(LibraryContext);
  if (context === null) {
    throw new Error('useLibrary has to be used within <LibraryState.Provider>');
  }
  return context;
};

interface LibraryStateProps {
  children: React.ReactNode;
}

export const LibraryState = ({ children }: LibraryStateProps) => {
  const { user } = useAuth();
  const { adminMode } = useConceptOptions();

  const [items, setItems] = useState<ILibraryItem[]>([]);
  const [templates, setTemplates] = useState<ILibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<ErrorData>(undefined);
  const [cachedTemplates, setCachedTemplates] = useState<IRSForm[]>([]);

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
      if (params.query) {
        result = result.filter(item => matchLibraryItem(item, params.query!));
      }
      return result;
    },
    [items, user]
  );

  const retrieveTemplate = useCallback(
    (templateID: LibraryItemID, callback: (schema: IRSForm) => void) => {
      const cached = cachedTemplates.find(schema => schema.id == templateID);
      if (cached) {
        callback(cached);
        return;
      }
      setError(undefined);
      getRSFormDetails(String(templateID), '', {
        showError: true,
        setLoading: setProcessing,
        onError: setError,
        onSuccess: data => {
          const schema = new RSFormLoader(data).produceRSForm();
          setCachedTemplates(prev => [...prev, schema]);
          callback(schema);
        }
      });
    },
    [cachedTemplates]
  );

  const reloadItems = useCallback(
    (callback?: () => void) => {
      setItems([]);
      setError(undefined);
      if (user?.is_staff && adminMode) {
        getAdminLibrary({
          setLoading: setLoading,
          showError: true,
          onError: setError,
          onSuccess: newData => {
            setItems(newData);
            if (callback) callback();
          }
        });
      } else {
        getLibrary({
          setLoading: setLoading,
          showError: true,
          onError: setError,
          onSuccess: newData => {
            setItems(newData);
            if (callback) callback();
          }
        });
      }
    },
    [user, adminMode]
  );

  const reloadTemplates = useCallback(() => {
    setTemplates([]);
    getTemplates({
      showError: true,
      onSuccess: newData => setTemplates(newData)
    });
  }, []);

  useEffect(() => {
    reloadItems();
  }, [reloadItems]);

  useEffect(() => {
    reloadTemplates();
  }, [reloadTemplates]);

  const localUpdateItem = useCallback(
    (data: ILibraryItem) => {
      const libraryItem = items.find(item => item.id === data.id);
      if (libraryItem) Object.assign(libraryItem, data);
    },
    [items]
  );

  const localUpdateTimestamp = useCallback(
    (target: LibraryItemID) => {
      const libraryItem = items.find(item => item.id === target);
      if (libraryItem) {
        libraryItem.time_update = Date();
      }
    },
    [items]
  );

  const createItem = useCallback(
    (data: IRSFormCreateData, callback?: DataCallback<ILibraryItem>) => {
      setError(undefined);
      postNewRSForm({
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setError,
        onSuccess: newSchema =>
          reloadItems(() => {
            if (user && !user.subscriptions.includes(newSchema.id)) {
              user.subscriptions.push(newSchema.id);
            }
            if (callback) callback(newSchema);
          })
      });
    },
    [reloadItems, user]
  );

  const destroyItem = useCallback(
    (target: LibraryItemID, callback?: () => void) => {
      setError(undefined);
      deleteLibraryItem(String(target), {
        showError: true,
        setLoading: setProcessing,
        onError: setError,
        onSuccess: () =>
          reloadItems(() => {
            if (user && user.subscriptions.includes(target)) {
              user.subscriptions.splice(
                user.subscriptions.findIndex(item => item === target),
                1
              );
            }
            if (callback) callback();
          })
      });
    },
    [setError, reloadItems, user]
  );

  const cloneItem = useCallback(
    (target: LibraryItemID, data: IRSFormCloneData, callback: DataCallback<IRSFormData>) => {
      if (!user) {
        return;
      }
      setError(undefined);
      postCloneLibraryItem(String(target), {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setError,
        onSuccess: newSchema =>
          reloadItems(() => {
            if (user && !user.subscriptions.includes(newSchema.id)) {
              user.subscriptions.push(newSchema.id);
            }
            if (callback) callback(newSchema);
          })
      });
    },
    [reloadItems, setError, user]
  );

  return (
    <LibraryContext.Provider
      value={{
        items,
        templates,
        loading,
        processing,
        error,
        setError,
        applyFilter,
        createItem,
        cloneItem,
        destroyItem,
        retrieveTemplate,
        localUpdateItem,
        localUpdateTimestamp
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};
