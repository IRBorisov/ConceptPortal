'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  DataCallback,
  deleteLibraryItem,
  getAdminLibrary,
  getLibrary,
  getRSFormDetails,
  getTemplates,
  postCloneLibraryItem,
  postCreateLibraryItem,
  postRSFormFromFile
} from '@/app/backendAPI';
import { ErrorData } from '@/components/info/InfoError';
import { FolderTree } from '@/models/FolderTree';
import { ILibraryItem, LibraryItemID, LocationHead } from '@/models/library';
import { ILibraryCreateData } from '@/models/library';
import { matchLibraryItem, matchLibraryItemLocation } from '@/models/libraryAPI';
import { ILibraryFilter } from '@/models/miscellaneous';
import { IRSForm, IRSFormCloneData, IRSFormData } from '@/models/rsform';
import { RSFormLoader } from '@/models/RSFormLoader';
import { contextOutsideScope } from '@/utils/labels';

import { useAuth } from './AuthContext';
import { useConceptOptions } from './ConceptOptionsContext';

interface ILibraryContext {
  items: ILibraryItem[];
  templates: ILibraryItem[];
  folders: FolderTree;

  loading: boolean;
  loadingError: ErrorData;
  setLoadingError: (error: ErrorData) => void;

  processing: boolean;
  processingError: ErrorData;
  setProcessingError: (error: ErrorData) => void;

  reloadItems: (callback?: () => void) => void;

  applyFilter: (params: ILibraryFilter) => ILibraryItem[];
  retrieveTemplate: (templateID: LibraryItemID, callback: (schema: IRSForm) => void) => void;
  createItem: (data: ILibraryCreateData, callback?: DataCallback<ILibraryItem>) => void;
  cloneItem: (target: LibraryItemID, data: IRSFormCloneData, callback: DataCallback<IRSFormData>) => void;
  destroyItem: (target: LibraryItemID, callback?: () => void) => void;

  localUpdateItem: (data: ILibraryItem) => void;
  localUpdateTimestamp: (target: LibraryItemID) => void;
}

const LibraryContext = createContext<ILibraryContext | null>(null);
export const useLibrary = (): ILibraryContext => {
  const context = useContext(LibraryContext);
  if (context === null) {
    throw new Error(contextOutsideScope('useLibrary', 'LibraryState'));
  }
  return context;
};

interface LibraryStateProps {
  children: React.ReactNode;
}

export const LibraryState = ({ children }: LibraryStateProps) => {
  const { user, loading: userLoading } = useAuth();
  const { adminMode } = useConceptOptions();

  const [items, setItems] = useState<ILibraryItem[]>([]);
  const [templates, setTemplates] = useState<ILibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [loadingError, setLoadingError] = useState<ErrorData>(undefined);
  const [processingError, setProcessingError] = useState<ErrorData>(undefined);
  const [cachedTemplates, setCachedTemplates] = useState<IRSForm[]>([]);

  const folders = useMemo(() => {
    const result = new FolderTree();
    result.addPath(LocationHead.USER, 0);
    result.addPath(LocationHead.COMMON, 0);
    result.addPath(LocationHead.LIBRARY, 0);
    result.addPath(LocationHead.PROJECTS, 0);
    items.forEach(item => result.addPath(item.location));
    return result;
  }, [items]);

  const applyFilter = useCallback(
    (filter: ILibraryFilter) => {
      let result = items;
      if (!filter.folderMode && filter.head) {
        result = result.filter(item => item.location.startsWith(filter.head!));
      }
      if (filter.folderMode && filter.location) {
        result = result.filter(item => item.location == filter.location);
      }
      if (filter.type) {
        result = result.filter(item => item.item_type === filter.type);
      }
      if (filter.isVisible !== undefined) {
        result = result.filter(item => filter.isVisible === item.visible);
      }
      if (filter.isOwned !== undefined) {
        result = result.filter(item => filter.isOwned === (item.owner === user?.id));
      }
      if (filter.isSubscribed !== undefined) {
        result = result.filter(item => filter.isSubscribed == user?.subscriptions.includes(item.id));
      }
      if (filter.isEditor !== undefined) {
        result = result.filter(item => filter.isEditor == user?.editor.includes(item.id));
      }
      if (!filter.folderMode && filter.path) {
        result = result.filter(item => matchLibraryItemLocation(item, filter.path!));
      }
      if (filter.query) {
        result = result.filter(item => matchLibraryItem(item, filter.query!));
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
      setProcessingError(undefined);
      getRSFormDetails(String(templateID), '', {
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
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
      setLoadingError(undefined);
      if (user?.is_staff && adminMode) {
        getAdminLibrary({
          setLoading: setLoading,
          showError: true,
          onError: setLoadingError,
          onSuccess: newData => {
            setItems(newData);
            if (callback) callback();
          }
        });
      } else {
        getLibrary({
          setLoading: setLoading,
          showError: true,
          onError: setLoadingError,
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
      setLoading: setProcessing,
      onError: setProcessingError,
      showError: true,
      onSuccess: newData => setTemplates(newData)
    });
  }, []);

  useEffect(() => {
    if (!userLoading) {
      reloadItems();
    }
  }, [reloadItems, userLoading]);

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
    (data: ILibraryCreateData, callback?: DataCallback<ILibraryItem>) => {
      const onSuccess = (newSchema: ILibraryItem) =>
        reloadItems(() => {
          if (user && !user.subscriptions.includes(newSchema.id)) {
            user.subscriptions.push(newSchema.id);
          }
          if (callback) callback(newSchema);
        });
      setProcessingError(undefined);
      if (data.file) {
        postRSFormFromFile({
          data: data,
          showError: true,
          setLoading: setProcessing,
          onError: setProcessingError,
          onSuccess: onSuccess
        });
      } else {
        postCreateLibraryItem({
          data: data,
          showError: true,
          setLoading: setProcessing,
          onError: setProcessingError,
          onSuccess: onSuccess
        });
      }
    },
    [reloadItems, user]
  );

  const destroyItem = useCallback(
    (target: LibraryItemID, callback?: () => void) => {
      setProcessingError(undefined);
      deleteLibraryItem(String(target), {
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
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
    [reloadItems, user]
  );

  const cloneItem = useCallback(
    (target: LibraryItemID, data: IRSFormCloneData, callback: DataCallback<IRSFormData>) => {
      if (!user) {
        return;
      }
      setProcessingError(undefined);
      postCloneLibraryItem(String(target), {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
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

  return (
    <LibraryContext.Provider
      value={{
        items,
        folders,
        templates,

        loading,
        loadingError,
        setLoadingError,

        processing,
        processingError,
        setProcessingError,

        reloadItems,

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
