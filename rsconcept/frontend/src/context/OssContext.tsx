'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { DataCallback } from '@/backend/apiTransport';
import {
  deleteUnsubscribe,
  patchLibraryItem,
  patchSetAccessPolicy,
  patchSetEditors,
  patchSetLocation,
  patchSetOwner,
  postSubscribe
} from '@/backend/library';
import { patchCreateInput, patchDeleteOperation, patchUpdatePositions, postCreateOperation } from '@/backend/oss';
import { type ErrorData } from '@/components/info/InfoError';
import { AccessPolicy, ILibraryItem } from '@/models/library';
import { ILibraryUpdateData } from '@/models/library';
import {
  IOperation,
  IOperationCreateData,
  IOperationSchema,
  IOperationSchemaData,
  IPositionsData,
  ITargetOperation
} from '@/models/oss';
import { UserID } from '@/models/user';
import { contextOutsideScope } from '@/utils/labels';

import { useAuth } from './AuthContext';
import { useLibrary } from './LibraryContext';

interface IOssContext {
  schema?: IOperationSchema;
  itemID: string;

  loading: boolean;
  errorLoading: ErrorData;
  processing: boolean;
  processingError: ErrorData;

  isOwned: boolean;
  isSubscribed: boolean;

  update: (data: ILibraryUpdateData, callback?: DataCallback<ILibraryItem>) => void;

  subscribe: (callback?: () => void) => void;
  unsubscribe: (callback?: () => void) => void;
  setOwner: (newOwner: UserID, callback?: () => void) => void;
  setAccessPolicy: (newPolicy: AccessPolicy, callback?: () => void) => void;
  setLocation: (newLocation: string, callback?: () => void) => void;
  setEditors: (newEditors: UserID[], callback?: () => void) => void;

  savePositions: (data: IPositionsData, callback?: () => void) => void;
  createOperation: (data: IOperationCreateData, callback?: DataCallback<IOperation>) => void;
  deleteOperation: (data: ITargetOperation, callback?: () => void) => void;
  createInput: (data: ITargetOperation, callback?: DataCallback<ILibraryItem>) => void;
}

const OssContext = createContext<IOssContext | null>(null);
export const useOSS = () => {
  const context = useContext(OssContext);
  if (context === null) {
    throw new Error(contextOutsideScope('useOSS', 'OssState'));
  }
  return context;
};

interface OssStateProps {
  itemID: string;
  children: React.ReactNode;
}

export const OssState = ({ itemID, children }: OssStateProps) => {
  const library = useLibrary();
  const schema = library.globalOSS;
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<ErrorData>(undefined);

  const [toggleTracking, setToggleTracking] = useState(false);

  const isOwned = useMemo(() => {
    return user?.id === schema?.owner || false;
  }, [user, schema?.owner]);

  const isSubscribed = useMemo(() => {
    if (!user || !schema || !user.id) {
      return false;
    }
    return schema.subscribers.includes(user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, schema, toggleTracking]);

  useEffect(() => {
    if (schema?.id !== Number(itemID)) {
      library.setGlobalID(itemID);
    }
  }, [itemID, schema, library]);

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
          const fullData: IOperationSchemaData = Object.assign(schema, newData);
          library.setGlobalOSS(fullData);
          library.localUpdateItem(newData);
          if (callback) callback(newData);
        }
      });
    },
    [itemID, schema, library]
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
    [itemID, user, schema]
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
          library.localUpdateItem(schema);
          if (callback) callback();
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

  const savePositions = useCallback(
    (data: IPositionsData, callback?: () => void) => {
      setProcessingError(undefined);
      patchUpdatePositions(itemID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: () => {
          library.localUpdateTimestamp(Number(itemID));
          if (callback) callback();
        }
      });
    },
    [itemID, library]
  );

  const createOperation = useCallback(
    (data: IOperationCreateData, callback?: DataCallback<IOperation>) => {
      setProcessingError(undefined);
      postCreateOperation(itemID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          library.setGlobalOSS(newData.oss);
          library.localUpdateTimestamp(newData.oss.id);
          if (callback) callback(newData.new_operation);
        }
      });
    },
    [itemID, library]
  );

  const deleteOperation = useCallback(
    (data: ITargetOperation, callback?: () => void) => {
      setProcessingError(undefined);
      patchDeleteOperation(itemID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          library.setGlobalOSS(newData);
          library.localUpdateTimestamp(newData.id);
          if (callback) callback();
        }
      });
    },
    [itemID, library]
  );

  const createInput = useCallback(
    (data: ITargetOperation, callback?: DataCallback<ILibraryItem>) => {
      setProcessingError(undefined);
      patchCreateInput(itemID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          library.setGlobalOSS(newData.oss);
          library.reloadItems(() => {
            if (callback) callback(newData.new_schema);
          });
        }
      });
    },
    [itemID, library]
  );

  return (
    <OssContext.Provider
      value={{
        schema,
        itemID,
        loading: library.ossLoading,
        errorLoading: library.ossError,
        processing,
        processingError,
        isOwned,
        isSubscribed,
        update,

        subscribe,
        unsubscribe,
        setOwner,
        setEditors,
        setAccessPolicy,
        setLocation,

        savePositions,
        createOperation,
        deleteOperation,
        createInput
      }}
    >
      {children}
    </OssContext.Provider>
  );
};
