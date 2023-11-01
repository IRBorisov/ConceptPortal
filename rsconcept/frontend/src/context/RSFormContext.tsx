import { createContext, useCallback, useContext, useMemo, useState } from 'react'

import { type ErrorInfo } from '../components/BackendError'
import { useRSFormDetails } from '../hooks/useRSFormDetails'
import { ILibraryItem } from '../models/library'
import { ILibraryUpdateData } from '../models/library'
import {
  IConstituentaList, IConstituentaMeta, ICstCreateData,
  ICstMovetoData, ICstRenameData, ICstUpdateData, 
  IRSForm, IRSFormUploadData
} from '../models/rsform'
import {
  type DataCallback, deleteUnsubscribe,
getTRSFile,
  patchConstituenta, patchDeleteConstituenta,
patchLibraryItem,
  patchMoveConstituenta, patchRenameConstituenta,
  patchResetAliases,   patchUploadTRS,  postClaimLibraryItem, postNewConstituenta, postSubscribe} from '../utils/backendAPI'
import { useAuth } from './AuthContext'
import { useLibrary } from './LibraryContext'

interface IRSFormContext {
  schema?: IRSForm

  error: ErrorInfo
  loading: boolean
  processing: boolean

  isOwned: boolean
  isEditable: boolean
  isClaimable: boolean
  isReadonly: boolean
  isTracking: boolean
  isForceAdmin: boolean

  toggleForceAdmin: () => void
  toggleReadonly: () => void
  
  update: (data: ILibraryUpdateData, callback?: DataCallback<ILibraryItem>) => void
  claim: (callback?: DataCallback<ILibraryItem>) => void
  subscribe: (callback?: () => void) => void
  unsubscribe: (callback?: () => void) => void
  download: (callback: DataCallback<Blob>) => void
  upload: (data: IRSFormUploadData, callback: () => void) => void

  resetAliases: (callback: () => void) => void

  cstCreate: (data: ICstCreateData, callback?: DataCallback<IConstituentaMeta>) => void
  cstRename: (data: ICstRenameData, callback?: DataCallback<IConstituentaMeta>) => void
  cstUpdate: (data: ICstUpdateData, callback?: DataCallback<IConstituentaMeta>) => void
  cstDelete: (data: IConstituentaList, callback?: () => void) => void
  cstMoveTo: (data: ICstMovetoData, callback?: () => void) => void
}

const RSFormContext = createContext<IRSFormContext | null>(null)
export const useRSForm = () => {
  const context = useContext(RSFormContext)
  if (context === null) {
    throw new Error(
      'useRSForm has to be used within <RSFormState.Provider>'
    )
  }
  return context
}

interface RSFormStateProps {
  schemaID: string
  children: React.ReactNode
}

export const RSFormState = ({ schemaID, children }: RSFormStateProps) => {
  const library = useLibrary();
  const { user } = useAuth();
  const { schema, reload, error, setError, setSchema, loading } = useRSFormDetails({ target: schemaID });
  const [ processing, setProcessing ] = useState(false);

  const [ isForceAdmin, setIsForceAdmin ] = useState(false);
  const [ isReadonly, setIsReadonly ] = useState(false);
  const [ toggleTracking, setToggleTracking ] = useState(false);

  const isOwned = useMemo(
  () => {
    return user?.id === schema?.owner || false;
  }, [user, schema?.owner]);

  const isClaimable = useMemo(
  () => {
    return (user?.id !== schema?.owner && schema?.is_common && !schema?.is_canonical) ?? false;
  }, [user, schema?.owner, schema?.is_common, schema?.is_canonical]);

  const isEditable = useMemo(
  () => {
    return (
      !loading && !processing && !isReadonly &&
      ((isOwned || (isForceAdmin && user?.is_staff)) ?? false)
    );
  }, [user?.is_staff, isReadonly, isForceAdmin, isOwned, loading, processing]);

  const isTracking = useMemo(
  () => {
    if (!user || !schema || !user.id) {
      return false;
    }
    return schema.subscribers.includes(user.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, schema, toggleTracking]);

  const update = useCallback(
  (data: ILibraryUpdateData, callback?: DataCallback<ILibraryItem>) => {
    if (!schema) {
      return;
    }
    setError(undefined)
    patchLibraryItem(schemaID, {
      data: data,
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSuccess: newData => {
        setSchema(Object.assign(schema, newData));
        const libraryItem = library.items.find(item => item.id === newData.id);
        if (libraryItem) {
          Object.assign(libraryItem, newData);
        }
        if (callback) callback(newData);
      }
    });
  }, [schemaID, setError, setSchema, schema, library]);
  
  const upload = useCallback(
  (data: IRSFormUploadData, callback?: () => void) => {
    if (!schema) {
      return;
    }
    setError(undefined)
    patchUploadTRS(schemaID, {
      data: data,
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSuccess: newData => {
        setSchema(newData);
        const libraryItem = library.items.find(item => item.id === newData.id);
        if (libraryItem) {
          Object.assign(libraryItem, newData);
        }
        if (callback) callback();
      }
    });
  }, [schemaID, setError, setSchema, schema, library]);

  const claim = useCallback(
  (callback?: DataCallback<ILibraryItem>) => {
    if (!schema || !user) {
      return;
    }
    setError(undefined)
    postClaimLibraryItem(schemaID, {
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSuccess: newData => {
        setSchema(Object.assign(schema, newData));
        const libraryItem = library.items.find(item => item.id === newData.id);
        if (libraryItem) {
          libraryItem.owner = user.id
        }
        if (!user.subscriptions.includes(schema.id)) {
          user.subscriptions.push(schema.id);
        }
        if (callback) callback(newData);
      }
    });
  }, [schemaID, setError, schema, user, setSchema, library]);
  
  const subscribe = useCallback(
  (callback?: () => void) => {
    if (!schema || !user) {
      return;
    }
    setError(undefined)
    postSubscribe(schemaID, {
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSuccess: () => {
        if (user.id && !schema.subscribers.includes(user.id)) {
          schema.subscribers.push(user.id);
        }
        if (!user.subscriptions.includes(schema.id)) {
          user.subscriptions.push(schema.id);
        }
        setToggleTracking(prev => !prev);
        if (callback) callback();
      }
    });
  }, [schemaID, setError, schema, user]);

  const unsubscribe = useCallback(
  (callback?: () => void) => {
    if (!schema || !user) {
      return;
    }
    setError(undefined)
    deleteUnsubscribe(schemaID, {
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSuccess: () => {
        if (user.id && schema.subscribers.includes(user.id)) {
          schema.subscribers.splice(schema.subscribers.indexOf(user.id), 1);
        }
        if (user.subscriptions.includes(schema.id)) {
          user.subscriptions.splice(user.subscriptions.indexOf(schema.id), 1);
        }
        setToggleTracking(prev => !prev);
        if (callback) callback();
      }
    });
  }, [schemaID, setError, schema, user]);

  const resetAliases = useCallback(
  (callback?: () => void) => {
    if (!schema || !user) {
      return;
    }
    setError(undefined)
    patchResetAliases(schemaID, {
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSuccess: newData => {
        setSchema(Object.assign(schema, newData));
        if (callback) callback();
      }
    });
  }, [schemaID, setError, schema, user, setSchema]);

  const download = useCallback(
  (callback: DataCallback<Blob>) => {
    setError(undefined)
    getTRSFile(schemaID, {
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSuccess: callback
    });
  }, [schemaID, setError]);

  const cstCreate = useCallback(
  (data: ICstCreateData, callback?: DataCallback<IConstituentaMeta>) => {
    setError(undefined)
    postNewConstituenta(schemaID, {
      data: data,
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSuccess: newData => {
        setSchema(newData.schema);
        if (callback) callback(newData.new_cst);
      }
    });
  }, [schemaID, setError, setSchema]);

  const cstDelete = useCallback(
  (data: IConstituentaList, callback?: () => void) => {
    setError(undefined)
    patchDeleteConstituenta(schemaID, {
      data: data,
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSuccess: newData => {
        setSchema(newData);
        if (callback) callback();
      }
    });
  }, [schemaID, setError, setSchema]);

  const cstUpdate = useCallback(
  (data: ICstUpdateData, callback?: DataCallback<IConstituentaMeta>) => {
    setError(undefined)
    patchConstituenta(String(data.id), {
      data: data,
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSuccess: newData => reload(setProcessing, () => {
        if (callback) callback(newData);
      })
    });
  }, [setError, reload]);

  const cstRename = useCallback(
  (data: ICstRenameData, callback?: DataCallback<IConstituentaMeta>) => {
    setError(undefined)
    patchRenameConstituenta(schemaID, {
      data: data,
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSuccess: newData => {
        setSchema(newData.schema);
        if (callback) callback(newData.new_cst);
      }
    });
  }, [setError, setSchema, schemaID]);

  const cstMoveTo = useCallback(
  (data: ICstMovetoData, callback?: () => void) => {
    setError(undefined)
    patchMoveConstituenta(schemaID, {
      data: data,
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSuccess: newData => {
        setSchema(newData);
        if (callback) callback();
      }
    });
  }, [schemaID, setError, setSchema]);

  return (
    <RSFormContext.Provider value={{
      schema,
      error, loading, processing,
      isForceAdmin, isReadonly, isOwned, isEditable,
      isClaimable, isTracking,
      toggleForceAdmin: () => setIsForceAdmin(prev => !prev),
      toggleReadonly: () => setIsReadonly(prev => !prev),
      update, download, upload, claim, resetAliases, subscribe, unsubscribe,
      cstUpdate, cstCreate, cstRename, cstDelete, cstMoveTo
    }}>
      { children }
    </RSFormContext.Provider>
  );
}
