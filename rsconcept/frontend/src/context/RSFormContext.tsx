'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { type ErrorData } from '@/components/InfoError';
import useRSFormDetails from '@/hooks/useRSFormDetails';
import { ILibraryItem, IVersionData } from '@/models/library';
import { ILibraryUpdateData } from '@/models/library';
import {
  ConstituentaID,
  IConstituentaList,
  IConstituentaMeta,
  ICstCreateData,
  ICstID,
  ICstMovetoData,
  ICstRenameData,
  ICstSubstituteData,
  ICstUpdateData,
  IRSForm,
  IRSFormUploadData
} from '@/models/rsform';
import {
  type DataCallback,
  deleteUnsubscribe,
  deleteVersion,
  getTRSFile,
  patchConstituenta,
  patchDeleteConstituenta,
  patchLibraryItem,
  patchMoveConstituenta,
  patchProduceStructure,
  patchRenameConstituenta,
  patchResetAliases,
  patchSubstituteConstituenta,
  patchUploadTRS,
  patchVersion,
  postClaimLibraryItem,
  postCreateVersion,
  postNewConstituenta,
  postSubscribe
} from '@/utils/backendAPI';

import { useAuth } from './AuthContext';
import { useLibrary } from './LibraryContext';

interface IRSFormContext {
  schema?: IRSForm;
  schemaID: string;

  error: ErrorData;
  loading: boolean;
  processing: boolean;

  isArchive: boolean;
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
  produceStructure: (data: ICstID, callback?: DataCallback<ConstituentaID[]>) => void;

  cstCreate: (data: ICstCreateData, callback?: DataCallback<IConstituentaMeta>) => void;
  cstRename: (data: ICstRenameData, callback?: DataCallback<IConstituentaMeta>) => void;
  cstSubstitute: (data: ICstSubstituteData, callback?: () => void) => void;
  cstUpdate: (data: ICstUpdateData, callback?: DataCallback<IConstituentaMeta>) => void;
  cstDelete: (data: IConstituentaList, callback?: () => void) => void;
  cstMoveTo: (data: ICstMovetoData, callback?: () => void) => void;

  versionCreate: (data: IVersionData, callback?: (version: number) => void) => void;
  versionUpdate: (target: number, data: IVersionData, callback?: () => void) => void;
  versionDelete: (target: number, callback?: () => void) => void;
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
  versionID?: string;
  children: React.ReactNode;
}

export const RSFormState = ({ schemaID, versionID, children }: RSFormStateProps) => {
  const library = useLibrary();
  const { user } = useAuth();
  const {
    schema, // prettier: split lines
    reload,
    error,
    setError,
    setSchema,
    loading
  } = useRSFormDetails({
    target: schemaID,
    version: versionID
  });
  const [processing, setProcessing] = useState(false);

  const [toggleTracking, setToggleTracking] = useState(false);

  const isOwned = useMemo(() => {
    return user?.id === schema?.owner || false;
  }, [user, schema?.owner]);

  const isArchive = useMemo(() => !!versionID, [versionID]);

  const isClaimable = useMemo(() => {
    return isArchive && ((user?.id !== schema?.owner && schema?.is_common && !schema?.is_canonical) ?? false);
  }, [user, schema?.owner, schema?.is_common, schema?.is_canonical, isArchive]);

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
        onError: setError,
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
        onError: setError,
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
        onError: setError,
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
        onError: setError,
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
        onError: setError,
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
        onError: setError,
        onSuccess: newData => {
          setSchema(Object.assign(schema, newData));
          library.localUpdateTimestamp(newData.id);
          if (callback) callback();
        }
      });
    },
    [schemaID, setError, schema, library, user, setSchema]
  );

  const produceStructure = useCallback(
    (data: ICstID, callback?: DataCallback<ConstituentaID[]>) => {
      setError(undefined);
      patchProduceStructure(schemaID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setError,
        onSuccess: newData => {
          setSchema(newData.schema);
          library.localUpdateTimestamp(newData.schema.id);
          if (callback) callback(newData.cst_list);
        }
      });
    },
    [setError, setSchema, library, schemaID]
  );

  const download = useCallback(
    (callback: DataCallback<Blob>) => {
      setError(undefined);
      getTRSFile(schemaID, String(schema?.version ?? ''), {
        showError: true,
        setLoading: setProcessing,
        onError: setError,
        onSuccess: callback
      });
    },
    [schemaID, setError, schema]
  );

  const cstCreate = useCallback(
    (data: ICstCreateData, callback?: DataCallback<IConstituentaMeta>) => {
      setError(undefined);
      postNewConstituenta(schemaID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setError,
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
        onError: setError,
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
        onError: setError,
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
        onError: setError,
        onSuccess: newData => {
          setSchema(newData.schema);
          library.localUpdateTimestamp(newData.schema.id);
          if (callback) callback(newData.new_cst);
        }
      });
    },
    [setError, setSchema, library, schemaID]
  );

  const cstSubstitute = useCallback(
    (data: ICstSubstituteData, callback?: () => void) => {
      setError(undefined);
      patchSubstituteConstituenta(schemaID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setError,
        onSuccess: newData => {
          setSchema(newData);
          library.localUpdateTimestamp(newData.id);
          if (callback) callback();
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
        onError: setError,
        onSuccess: newData => {
          setSchema(newData);
          library.localUpdateTimestamp(Number(schemaID));
          if (callback) callback();
        }
      });
    },
    [schemaID, setError, library, setSchema]
  );

  const versionCreate = useCallback(
    (data: IVersionData, callback?: (version: number) => void) => {
      setError(undefined);
      postCreateVersion(schemaID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setError,
        onSuccess: newData => {
          setSchema(newData.schema);
          library.localUpdateTimestamp(Number(schemaID));
          if (callback) callback(newData.version);
        }
      });
    },
    [schemaID, setError, library, setSchema]
  );

  const versionUpdate = useCallback(
    (target: number, data: IVersionData, callback?: () => void) => {
      setError(undefined);
      patchVersion(String(target), {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setError,
        onSuccess: () => {
          schema!.versions = schema!.versions.map(prev => {
            if (prev.id === target) {
              prev.description = data.description;
              prev.version = data.version;
              return prev;
            } else {
              return prev;
            }
          });
          setSchema(schema);
          if (callback) callback();
        }
      });
    },
    [setError, schema, setSchema]
  );

  const versionDelete = useCallback(
    (target: number, callback?: () => void) => {
      setError(undefined);
      deleteVersion(String(target), {
        showError: true,
        setLoading: setProcessing,
        onError: setError,
        onSuccess: () => {
          schema!.versions = schema!.versions.filter(prev => prev.id !== target);
          setSchema(schema);
          if (callback) callback();
        }
      });
    },
    [setError, schema, setSchema]
  );

  return (
    <RSFormContext.Provider
      value={{
        schema,
        schemaID,
        error,
        loading,
        processing,
        isOwned,
        isClaimable,
        isSubscribed,
        isArchive,
        update,
        download,
        upload,
        claim,
        resetAliases,
        produceStructure,
        subscribe,
        unsubscribe,
        cstUpdate,
        cstCreate,
        cstRename,
        cstSubstitute,
        cstDelete,
        cstMoveTo,
        versionCreate,
        versionUpdate,
        versionDelete
      }}
    >
      {children}
    </RSFormContext.Provider>
  );
};
