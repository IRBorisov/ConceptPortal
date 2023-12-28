'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { type ErrorData } from '@/components/InfoError';
import useRSFormDetails from '@/hooks/useRSFormDetails';
import { ILibraryItem } from '@/models/library';
import { ILibraryUpdateData } from '@/models/library';
import {
  IConstituentaList,
  IConstituentaMeta,
  ICstCreateData,
  ICstMovetoData,
  ICstRenameData,
  ICstUpdateData,
  IRSForm,
  IRSFormUploadData
} from '@/models/rsform';
import {
  type DataCallback,
  deleteUnsubscribe,
  getTRSFile,
  patchConstituenta,
  patchDeleteConstituenta,
  patchLibraryItem,
  patchMoveConstituenta,
  patchRenameConstituenta,
  patchResetAliases,
  patchUploadTRS,
  postClaimLibraryItem,
  postNewConstituenta,
  postSubscribe
} from '@/utils/backendAPI';

import { useAuth } from './AuthContext';
import { useLibrary } from './LibraryContext';

interface IRSFormContext {
  schema?: IRSForm;

  error: ErrorData;
  loading: boolean;
  processing: boolean;

  isOwned: boolean;
  isClaimable: boolean;
  isSubscribed: boolean;

  update: (data: ILibraryUpdateData, callback?: DataCallback<ILibraryItem>) => void;
  claim: (callback?: DataCallback<ILibraryItem>) => void;
  subscribe: (callback?: () => void) => void;
  unsubscribe: (callback?: () => void) => void;
  download: (callback: DataCallback<Blob>) => void;
  upload: (data: IRSFormUploadData, callback: () => void) => void;

  resetAliases: (callback: () => void) => void;

  cstCreate: (data: ICstCreateData, callback?: DataCallback<IConstituentaMeta>) => void;
  cstRename: (data: ICstRenameData, callback?: DataCallback<IConstituentaMeta>) => void;
  cstUpdate: (data: ICstUpdateData, callback?: DataCallback<IConstituentaMeta>) => void;
  cstDelete: (data: IConstituentaList, callback?: () => void) => void;
  cstMoveTo: (data: ICstMovetoData, callback?: () => void) => void;
}

const RSFormContext = createContext<IRSFormContext | null>(null);
export const useRSForm = () => {
  const context = useContext(RSFormContext);
  if (context === null) {
    throw new Error('useRSForm has to be used within <RSFormState.Provider>');
  }
  return context;
};

interface RSFormStateProps {
  schemaID: string;
  children: React.ReactNode;
}

export const RSFormState = ({ schemaID, children }: RSFormStateProps) => {
  const library = useLibrary();
  const { user } = useAuth();
  const { schema, reload, error, setError, setSchema, loading } = useRSFormDetails({ target: schemaID });
  const [processing, setProcessing] = useState(false);

  const [toggleTracking, setToggleTracking] = useState(false);

  const isOwned = useMemo(() => {
    return user?.id === schema?.owner || false;
  }, [user, schema?.owner]);

  const isClaimable = useMemo(() => {
    return (user?.id !== schema?.owner && schema?.is_common && !schema?.is_canonical) ?? false;
  }, [user, schema?.owner, schema?.is_common, schema?.is_canonical]);

  const isSubscribed = useMemo(() => {
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
      setError(undefined);
      patchLibraryItem(schemaID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: error => setError(error),
        onSuccess: newData => {
          setSchema(Object.assign(schema, newData));
          library.localUpdateItem(newData);
          if (callback) callback(newData);
        }
      });
    },
    [schemaID, setError, setSchema, schema, library]
  );

  const upload = useCallback(
    (data: IRSFormUploadData, callback?: () => void) => {
      if (!schema) {
        return;
      }
      setError(undefined);
      patchUploadTRS(schemaID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: error => setError(error),
        onSuccess: newData => {
          setSchema(newData);
          library.localUpdateItem(newData);
          if (callback) callback();
        }
      });
    },
    [schemaID, setError, setSchema, schema, library]
  );

  const claim = useCallback(
    (callback?: DataCallback<ILibraryItem>) => {
      if (!schema || !user) {
        return;
      }
      setError(undefined);
      postClaimLibraryItem(schemaID, {
        showError: true,
        setLoading: setProcessing,
        onError: error => setError(error),
        onSuccess: newData => {
          setSchema(Object.assign(schema, newData));
          library.localUpdateItem(newData);
          if (!user.subscriptions.includes(newData.id)) {
            user.subscriptions.push(newData.id);
          }
          if (callback) callback(newData);
        }
      });
    },
    [schemaID, setError, schema, user, setSchema, library]
  );

  const subscribe = useCallback(
    (callback?: () => void) => {
      if (!schema || !user) {
        return;
      }
      setError(undefined);
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
    },
    [schemaID, setError, schema, user]
  );

  const unsubscribe = useCallback(
    (callback?: () => void) => {
      if (!schema || !user) {
        return;
      }
      setError(undefined);
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
    },
    [schemaID, setError, schema, user]
  );

  const resetAliases = useCallback(
    (callback?: () => void) => {
      if (!schema || !user) {
        return;
      }
      setError(undefined);
      patchResetAliases(schemaID, {
        showError: true,
        setLoading: setProcessing,
        onError: error => setError(error),
        onSuccess: newData => {
          setSchema(Object.assign(schema, newData));
          library.localUpdateTimestamp(newData.id);
          if (callback) callback();
        }
      });
    },
    [schemaID, setError, schema, library, user, setSchema]
  );

  const download = useCallback(
    (callback: DataCallback<Blob>) => {
      setError(undefined);
      getTRSFile(schemaID, {
        showError: true,
        setLoading: setProcessing,
        onError: error => setError(error),
        onSuccess: callback
      });
    },
    [schemaID, setError]
  );

  const cstCreate = useCallback(
    (data: ICstCreateData, callback?: DataCallback<IConstituentaMeta>) => {
      setError(undefined);
      postNewConstituenta(schemaID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: error => setError(error),
        onSuccess: newData => {
          setSchema(newData.schema);
          library.localUpdateTimestamp(newData.schema.id);
          if (callback) callback(newData.new_cst);
        }
      });
    },
    [schemaID, setError, library, setSchema]
  );

  const cstDelete = useCallback(
    (data: IConstituentaList, callback?: () => void) => {
      setError(undefined);
      patchDeleteConstituenta(schemaID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: error => setError(error),
        onSuccess: newData => {
          setSchema(newData);
          library.localUpdateTimestamp(newData.id);
          if (callback) callback();
        }
      });
    },
    [schemaID, setError, library, setSchema]
  );

  const cstUpdate = useCallback(
    (data: ICstUpdateData, callback?: DataCallback<IConstituentaMeta>) => {
      setError(undefined);
      patchConstituenta(String(data.id), {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: error => setError(error),
        onSuccess: newData =>
          reload(setProcessing, () => {
            library.localUpdateTimestamp(Number(schemaID));
            if (callback) callback(newData);
          })
      });
    },
    [setError, schemaID, library, reload]
  );

  const cstRename = useCallback(
    (data: ICstRenameData, callback?: DataCallback<IConstituentaMeta>) => {
      setError(undefined);
      patchRenameConstituenta(schemaID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: error => setError(error),
        onSuccess: newData => {
          setSchema(newData.schema);
          library.localUpdateTimestamp(newData.schema.id);
          if (callback) callback(newData.new_cst);
        }
      });
    },
    [setError, setSchema, library, schemaID]
  );

  const cstMoveTo = useCallback(
    (data: ICstMovetoData, callback?: () => void) => {
      setError(undefined);
      patchMoveConstituenta(schemaID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: error => setError(error),
        onSuccess: newData => {
          setSchema(newData);
          library.localUpdateTimestamp(Number(schemaID));
          if (callback) callback();
        }
      });
    },
    [schemaID, setError, library, setSchema]
  );

  return (
    <RSFormContext.Provider
      value={{
        schema,
        error,
        loading,
        processing,
        isOwned,
        isClaimable,
        isSubscribed,
        update,
        download,
        upload,
        claim,
        resetAliases,
        subscribe,
        unsubscribe,
        cstUpdate,
        cstCreate,
        cstRename,
        cstDelete,
        cstMoveTo
      }}
    >
      {children}
    </RSFormContext.Provider>
  );
};
