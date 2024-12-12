'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { DataCallback } from '@/backend/apiTransport';
import {
  deleteLibraryItem,
  getAdminLibrary,
  getLibrary,
  getTemplates,
  patchRenameLocation,
  postCloneLibraryItem,
  postCreateLibraryItem
} from '@/backend/library';
import { getRSFormDetails, postRSFormFromFile } from '@/backend/rsforms';
import { ErrorData } from '@/components/info/InfoError';
import { FolderTree } from '@/models/FolderTree';
import { ILibraryItem, IRenameLocationData, LibraryItemID, LocationHead } from '@/models/library';
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
  renameLocation: (data: IRenameLocationData, callback?: () => void) => void;

  localUpdateItem: (data: Partial<ILibraryItem>) => void;
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

export const LibraryState = ({ children }: React.PropsWithChildren) => {
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
        if (filter.subfolders) {
          result = result.filter(
            item => item.location == filter.location || item.location.startsWith(filter.location! + '/')
          );
        } else {
          result = result.filter(item => item.location == filter.location);
        }
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
      if (filter.isEditor !== undefined) {
        result = result.filter(item => filter.isEditor == user?.editor.includes(item.id));
      }
      if (filter.filterUser !== undefined) {
        result = result.filter(item => filter.filterUser === item.owner);
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
            callback?.();
          }
        });
      } else {
        getLibrary({
          setLoading: setLoading,
          showError: true,
          onError: setLoadingError,
          onSuccess: newData => {
            setItems(newData);
            callback?.();
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
    (data: Partial<ILibraryItem>) => {
      setItems(prev => prev.map(item => (item.id === data.id ? { ...item, ...data } : item)));
    },
    [setItems]
  );

  const localUpdateTimestamp = useCallback(
    (target: LibraryItemID) => {
      setItems(prev => prev.map(item => (item.id === target ? { ...item, time_update: Date() } : item)));
    },
    [setItems]
  );

  const createItem = useCallback(
    (data: ILibraryCreateData, callback?: DataCallback<ILibraryItem>) => {
      const onSuccess = (newSchema: ILibraryItem) =>
        reloadItems(() => {
          callback?.(newSchema);
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
    [reloadItems]
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
            callback?.();
          })
      });
    },
    [reloadItems]
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
            callback?.(newSchema);
          })
      });
    },
    [reloadItems, user]
  );

  const renameLocation = useCallback(
    (data: IRenameLocationData, callback?: () => void) => {
      setProcessingError(undefined);
      patchRenameLocation({
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: () =>
          reloadItems(() => {
            callback?.();
          })
      });
    },
    [reloadItems]
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
        reloadItems,

        processing,
        processingError,
        setProcessingError,

        applyFilter,
        createItem,
        cloneItem,
        destroyItem,
        renameLocation,

        retrieveTemplate,
        localUpdateItem,
        localUpdateTimestamp
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};
