'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { DataCallback } from '@/backend/apiTransport';
import {
  deleteUnsubscribe,
  patchLibraryItem,
  patchSetAccessPolicy,
  patchSetEditors,
  patchSetLocation,
  patchSetOwner,
  postCreateVersion,
  postSubscribe
} from '@/backend/library';
import {
  getTRSFile,
  patchDeleteConstituenta,
  patchInlineSynthesis,
  patchMoveConstituenta,
  patchProduceStructure,
  patchRenameConstituenta,
  patchResetAliases,
  patchRestoreOrder,
  patchSubstituteConstituents,
  patchUpdateConstituenta,
  patchUploadTRS,
  postCreateConstituenta
} from '@/backend/rsforms';
import { deleteVersion, patchRestoreVersion, patchVersion } from '@/backend/versions';
import { type ErrorData } from '@/components/info/InfoError';
import useRSFormDetails from '@/hooks/useRSFormDetails';
import { AccessPolicy, ILibraryItem, IVersionData, VersionID } from '@/models/library';
import { ILibraryUpdateData } from '@/models/library';
import { ICstSubstituteData } from '@/models/oss';
import {
  ConstituentaID,
  IConstituentaList,
  IConstituentaMeta,
  ICstCreateData,
  ICstMovetoData,
  ICstRenameData,
  ICstUpdateData,
  IInlineSynthesisData,
  IRSForm,
  IRSFormData,
  IRSFormUploadData,
  ITargetCst
} from '@/models/rsform';
import { UserID } from '@/models/user';
import { contextOutsideScope } from '@/utils/labels';

import { useAuth } from './AuthContext';
import { useLibrary } from './LibraryContext';

interface IRSFormContext {
  schema?: IRSForm;
  itemID: string;
  versionID?: string;

  loading: boolean;
  errorLoading: ErrorData;
  processing: boolean;
  processingError: ErrorData;

  isArchive: boolean;
  isOwned: boolean;
  isSubscribed: boolean;

  update: (data: ILibraryUpdateData, callback?: DataCallback<ILibraryItem>) => void;
  download: (callback: DataCallback<Blob>) => void;
  upload: (data: IRSFormUploadData, callback: () => void) => void;

  subscribe: (callback?: () => void) => void;
  unsubscribe: (callback?: () => void) => void;
  setOwner: (newOwner: UserID, callback?: () => void) => void;
  setAccessPolicy: (newPolicy: AccessPolicy, callback?: () => void) => void;
  setLocation: (newLocation: string, callback?: () => void) => void;
  setEditors: (newEditors: UserID[], callback?: () => void) => void;

  resetAliases: (callback: () => void) => void;
  restoreOrder: (callback: () => void) => void;
  produceStructure: (data: ITargetCst, callback?: DataCallback<ConstituentaID[]>) => void;
  inlineSynthesis: (data: IInlineSynthesisData, callback?: DataCallback<IRSFormData>) => void;

  cstCreate: (data: ICstCreateData, callback?: DataCallback<IConstituentaMeta>) => void;
  cstRename: (data: ICstRenameData, callback?: DataCallback<IConstituentaMeta>) => void;
  cstSubstitute: (data: ICstSubstituteData, callback?: () => void) => void;
  cstUpdate: (data: ICstUpdateData, callback?: DataCallback<IConstituentaMeta>) => void;
  cstDelete: (data: IConstituentaList, callback?: () => void) => void;
  cstMoveTo: (data: ICstMovetoData, callback?: () => void) => void;

  versionCreate: (data: IVersionData, callback?: (version: VersionID) => void) => void;
  versionUpdate: (target: VersionID, data: IVersionData, callback?: () => void) => void;
  versionDelete: (target: VersionID, callback?: () => void) => void;
  versionRestore: (target: string, callback?: () => void) => void;
}

const RSFormContext = createContext<IRSFormContext | null>(null);
export const useRSForm = () => {
  const context = useContext(RSFormContext);
  if (context === null) {
    throw new Error(contextOutsideScope('useRSForm', 'RSFormState'));
  }
  return context;
};

interface RSFormStateProps {
  itemID: string;
  versionID?: string;
  children: React.ReactNode;
}

export const RSFormState = ({ itemID, versionID, children }: RSFormStateProps) => {
  const library = useLibrary();
  const { user } = useAuth();
  const {
    schema, // prettier: split lines
    reload,
    error: errorLoading,
    setSchema,
    loading
  } = useRSFormDetails({
    target: itemID,
    version: versionID
  });
  const [processing, setProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<ErrorData>(undefined);

  const [toggleTracking, setToggleTracking] = useState(false);

  const isOwned = useMemo(() => {
    return user?.id === schema?.owner || false;
  }, [user, schema?.owner]);

  const isArchive = useMemo(() => !!versionID, [versionID]);

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
      setProcessingError(undefined);
      patchLibraryItem(itemID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          setSchema(Object.assign(schema, newData));
          library.localUpdateItem(newData);
          if (library.globalOSS?.schemas.includes(newData.id)) {
            library.reloadOSS(() => {
              if (callback) callback(newData);
            });
          } else if (callback) callback(newData);
        }
      });
    },
    [itemID, setSchema, schema, library]
  );

  const upload = useCallback(
    (data: IRSFormUploadData, callback?: () => void) => {
      if (!schema) {
        return;
      }
      setProcessingError(undefined);
      patchUploadTRS(itemID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          setSchema(newData);
          library.localUpdateItem(newData);
          if (callback) callback();
        }
      });
    },
    [itemID, setSchema, schema, library]
  );

  const subscribe = useCallback(
    (callback?: () => void) => {
      if (!schema || !user) {
        return;
      }
      setProcessingError(undefined);
      postSubscribe(itemID, {
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
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
    [itemID, schema, user]
  );

  const unsubscribe = useCallback(
    (callback?: () => void) => {
      if (!schema || !user) {
        return;
      }
      setProcessingError(undefined);
      deleteUnsubscribe(itemID, {
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
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
    [itemID, schema, user]
  );

  const setOwner = useCallback(
    (newOwner: UserID, callback?: () => void) => {
      if (!schema) {
        return;
      }
      setProcessingError(undefined);
      patchSetOwner(itemID, {
        data: {
          user: newOwner
        },
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: () => {
          schema.owner = newOwner;
          library.localUpdateItem(schema);
          if (callback) callback();
        }
      });
    },
    [itemID, schema, library]
  );

  const setAccessPolicy = useCallback(
    (newPolicy: AccessPolicy, callback?: () => void) => {
      if (!schema) {
        return;
      }
      setProcessingError(undefined);
      patchSetAccessPolicy(itemID, {
        data: {
          access_policy: newPolicy
        },
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: () => {
          schema.access_policy = newPolicy;
          library.localUpdateItem(schema);
          if (callback) callback();
        }
      });
    },
    [itemID, schema, library]
  );

  const setLocation = useCallback(
    (newLocation: string, callback?: () => void) => {
      if (!schema) {
        return;
      }
      setProcessingError(undefined);
      patchSetLocation(itemID, {
        data: {
          location: newLocation
        },
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: () => {
          schema.location = newLocation;
          library.reloadItems(callback);
        }
      });
    },
    [itemID, schema, library]
  );

  const setEditors = useCallback(
    (newEditors: UserID[], callback?: () => void) => {
      if (!schema) {
        return;
      }
      setProcessingError(undefined);
      patchSetEditors(itemID, {
        data: {
          users: newEditors
        },
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: () => {
          schema.editors = newEditors;
          if (callback) callback();
        }
      });
    },
    [itemID, schema]
  );

  const resetAliases = useCallback(
    (callback?: () => void) => {
      if (!schema || !user) {
        return;
      }
      setProcessingError(undefined);
      patchResetAliases(itemID, {
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          setSchema(newData);
          library.localUpdateTimestamp(newData.id);
          if (callback) callback();
        }
      });
    },
    [itemID, schema, library, user, setSchema]
  );

  const restoreOrder = useCallback(
    (callback?: () => void) => {
      if (!schema || !user) {
        return;
      }
      setProcessingError(undefined);
      patchRestoreOrder(itemID, {
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          setSchema(newData);
          library.localUpdateTimestamp(newData.id);
          if (callback) callback();
        }
      });
    },
    [itemID, schema, library, user, setSchema]
  );

  const produceStructure = useCallback(
    (data: ITargetCst, callback?: DataCallback<ConstituentaID[]>) => {
      setProcessingError(undefined);
      patchProduceStructure(itemID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          setSchema(newData.schema);
          library.localUpdateTimestamp(newData.schema.id);
          if (callback) callback(newData.cst_list);
        }
      });
    },
    [setSchema, library, itemID]
  );

  const download = useCallback(
    (callback: DataCallback<Blob>) => {
      setProcessingError(undefined);
      getTRSFile(itemID, String(schema?.version ?? ''), {
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: callback
      });
    },
    [itemID, schema]
  );

  const cstCreate = useCallback(
    (data: ICstCreateData, callback?: DataCallback<IConstituentaMeta>) => {
      setProcessingError(undefined);
      postCreateConstituenta(itemID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          setSchema(newData.schema);
          library.localUpdateTimestamp(newData.schema.id);
          if (callback) callback(newData.new_cst);
        }
      });
    },
    [itemID, library, setSchema]
  );

  const cstDelete = useCallback(
    (data: IConstituentaList, callback?: () => void) => {
      setProcessingError(undefined);
      patchDeleteConstituenta(itemID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          setSchema(newData);
          library.localUpdateTimestamp(newData.id);
          if (callback) callback();
        }
      });
    },
    [itemID, library, setSchema]
  );

  const cstUpdate = useCallback(
    (data: ICstUpdateData, callback?: DataCallback<IConstituentaMeta>) => {
      setProcessingError(undefined);
      patchUpdateConstituenta(itemID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData =>
          reload(setProcessing, () => {
            library.localUpdateTimestamp(Number(itemID));
            if (callback) callback(newData);
          })
      });
    },
    [itemID, library, reload]
  );

  const cstRename = useCallback(
    (data: ICstRenameData, callback?: DataCallback<IConstituentaMeta>) => {
      setProcessingError(undefined);
      patchRenameConstituenta(itemID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          setSchema(newData.schema);
          library.localUpdateTimestamp(newData.schema.id);
          if (callback) callback(newData.new_cst);
        }
      });
    },
    [setSchema, library, itemID]
  );

  const cstSubstitute = useCallback(
    (data: ICstSubstituteData, callback?: () => void) => {
      setProcessingError(undefined);
      patchSubstituteConstituents(itemID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          setSchema(newData);
          library.localUpdateTimestamp(newData.id);
          if (callback) callback();
        }
      });
    },
    [setSchema, library, itemID]
  );

  const cstMoveTo = useCallback(
    (data: ICstMovetoData, callback?: () => void) => {
      setProcessingError(undefined);
      patchMoveConstituenta(itemID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          setSchema(newData);
          library.localUpdateTimestamp(Number(itemID));
          if (callback) callback();
        }
      });
    },
    [itemID, library, setSchema]
  );

  const versionCreate = useCallback(
    (data: IVersionData, callback?: (version: number) => void) => {
      setProcessingError(undefined);
      postCreateVersion(itemID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          setSchema(newData.schema);
          library.localUpdateTimestamp(Number(itemID));
          if (callback) callback(newData.version);
        }
      });
    },
    [itemID, library, setSchema]
  );

  const versionUpdate = useCallback(
    (target: number, data: IVersionData, callback?: () => void) => {
      setProcessingError(undefined);
      patchVersion(String(target), {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
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
    [schema, setSchema]
  );

  const versionDelete = useCallback(
    (target: number, callback?: () => void) => {
      setProcessingError(undefined);
      deleteVersion(String(target), {
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: () => {
          schema!.versions = schema!.versions.filter(prev => prev.id !== target);
          setSchema(schema);
          if (callback) callback();
        }
      });
    },
    [schema, setSchema]
  );

  const versionRestore = useCallback(
    (target: string, callback?: () => void) => {
      setProcessingError(undefined);
      patchRestoreVersion(target, {
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          setSchema(newData);
          library.localUpdateItem(newData);
          if (callback) callback();
        }
      });
    },
    [setSchema, library]
  );

  const inlineSynthesis = useCallback(
    (data: IInlineSynthesisData, callback?: DataCallback<IRSFormData>) => {
      setProcessingError(undefined);
      patchInlineSynthesis({
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          setSchema(newData);
          library.localUpdateTimestamp(Number(itemID));
          if (callback) callback(newData);
        }
      });
    },
    [library, itemID, setSchema]
  );

  return (
    <RSFormContext.Provider
      value={{
        schema,
        itemID,
        versionID,
        loading,
        errorLoading,
        processing,
        processingError,
        isOwned,
        isSubscribed,
        isArchive,
        update,
        download,
        upload,
        restoreOrder,
        resetAliases,
        produceStructure,
        inlineSynthesis,

        subscribe,
        unsubscribe,
        setOwner,
        setEditors,
        setAccessPolicy,
        setLocation,

        cstUpdate,
        cstCreate,
        cstRename,
        cstSubstitute,
        cstDelete,
        cstMoveTo,
        versionCreate,
        versionUpdate,
        versionDelete,
        versionRestore
      }}
    >
      {children}
    </RSFormContext.Provider>
  );
};
