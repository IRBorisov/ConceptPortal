'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { DataCallback } from '@/backend/apiTransport';
import {
  patchLibraryItem,
  patchSetAccessPolicy,
  patchSetEditors,
  patchSetLocation,
  patchSetOwner
} from '@/backend/library';
import {
  patchCreateInput,
  patchDeleteOperation,
  patchSetInput,
  patchUpdateOperation,
  patchUpdatePositions,
  postCreateOperation,
  postExecuteOperation,
  postRelocateConstituents
} from '@/backend/oss';
import { type ErrorData } from '@/components/info/InfoError';
import { AccessPolicy, ILibraryItem } from '@/models/library';
import { ILibraryUpdateData } from '@/models/library';
import {
  ICstRelocateData,
  IOperationCreateData,
  IOperationData,
  IOperationDeleteData,
  IOperationSchema,
  IOperationSchemaData,
  IOperationSetInputData,
  IOperationUpdateData,
  IPositionsData,
  ITargetOperation
} from '@/models/oss';
import { UserID } from '@/models/user';
import { contextOutsideScope } from '@/utils/labels';

import { useAuth } from './AuthContext';
import { useGlobalOss } from './GlobalOssContext';
import { useLibrary } from './LibraryContext';

interface IOssContext {
  schema?: IOperationSchema;
  itemID: string;

  loading: boolean;
  loadingError: ErrorData;
  processing: boolean;
  processingError: ErrorData;

  isOwned: boolean;

  update: (data: ILibraryUpdateData, callback?: DataCallback<ILibraryItem>) => void;

  setOwner: (newOwner: UserID, callback?: () => void) => void;
  setAccessPolicy: (newPolicy: AccessPolicy, callback?: () => void) => void;
  setLocation: (newLocation: string, callback?: () => void) => void;
  setEditors: (newEditors: UserID[], callback?: () => void) => void;

  savePositions: (data: IPositionsData, callback?: () => void) => void;
  createOperation: (data: IOperationCreateData, callback?: DataCallback<IOperationData>) => void;
  deleteOperation: (data: IOperationDeleteData, callback?: () => void) => void;
  createInput: (data: ITargetOperation, callback?: DataCallback<ILibraryItem>) => void;
  setInput: (data: IOperationSetInputData, callback?: () => void) => void;
  updateOperation: (data: IOperationUpdateData, callback?: () => void) => void;
  executeOperation: (data: ITargetOperation, callback?: () => void) => void;
  relocateConstituents: (data: ICstRelocateData, callback?: () => void) => void;
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
}

export const OssState = ({ itemID, children }: React.PropsWithChildren<OssStateProps>) => {
  const library = useLibrary();
  const ossData = useGlobalOss();
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<ErrorData>(undefined);

  const isOwned = useMemo(() => {
    return user?.id === ossData.schema?.owner || false;
  }, [user, ossData.schema?.owner]);

  useEffect(() => {
    ossData.setID(itemID);
  }, [itemID, ossData]);

  const update = useCallback(
    (data: ILibraryUpdateData, callback?: DataCallback<ILibraryItem>) => {
      if (!ossData.schema) {
        return;
      }
      setProcessingError(undefined);
      patchLibraryItem(itemID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          const fullData: IOperationSchemaData = Object.assign(ossData.schema!, newData);
          ossData.setData(fullData);
          library.localUpdateItem(newData);
          callback?.(newData);
        }
      });
    },
    [itemID, library, ossData]
  );

  const setOwner = useCallback(
    (newOwner: UserID, callback?: () => void) => {
      if (!ossData.schema) {
        return;
      }
      setProcessingError(undefined);
      patchSetOwner(itemID, {
        data: { user: newOwner },
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: () => {
          ossData.partialUpdate({ owner: newOwner });
          library.reloadItems(callback);
        }
      });
    },
    [itemID, ossData, library]
  );

  const setAccessPolicy = useCallback(
    (newPolicy: AccessPolicy, callback?: () => void) => {
      if (!ossData.schema) {
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
          ossData.partialUpdate({ access_policy: newPolicy });
          library.reloadItems(callback);
        }
      });
    },
    [itemID, ossData, library]
  );

  const setLocation = useCallback(
    (newLocation: string, callback?: () => void) => {
      if (!ossData.schema) {
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
          ossData.partialUpdate({ location: newLocation });
          library.reloadItems(callback);
        }
      });
    },
    [itemID, ossData, library]
  );

  const setEditors = useCallback(
    (newEditors: UserID[], callback?: () => void) => {
      if (!ossData.schema) {
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
          ossData.partialUpdate({ editors: newEditors });
          library.reloadItems(callback);
        }
      });
    },
    [itemID, ossData, library]
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
          callback?.();
        }
      });
    },
    [itemID, library]
  );

  const createOperation = useCallback(
    (data: IOperationCreateData, callback?: DataCallback<IOperationData>) => {
      setProcessingError(undefined);
      postCreateOperation(itemID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          ossData.setData(newData.oss);
          library.localUpdateTimestamp(newData.oss.id);
          callback?.(newData.new_operation);
        }
      });
    },
    [itemID, library, ossData]
  );

  const deleteOperation = useCallback(
    (data: IOperationDeleteData, callback?: () => void) => {
      setProcessingError(undefined);
      patchDeleteOperation(itemID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          ossData.setData(newData);
          library.reloadItems(callback);
        }
      });
    },
    [itemID, library, ossData]
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
          ossData.setData(newData.oss);
          library.reloadItems(() => {
            callback?.(newData.new_schema);
          });
        }
      });
    },
    [itemID, library, ossData]
  );

  const setInput = useCallback(
    (data: IOperationSetInputData, callback?: () => void) => {
      if (!ossData.schema) {
        return;
      }
      setProcessingError(undefined);
      patchSetInput(itemID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          ossData.setData(newData);
          library.reloadItems(callback);
        }
      });
    },
    [itemID, ossData, library]
  );

  const updateOperation = useCallback(
    (data: IOperationUpdateData, callback?: () => void) => {
      if (!ossData.schema) {
        return;
      }
      setProcessingError(undefined);
      patchUpdateOperation(itemID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          ossData.setData(newData);
          library.reloadItems(callback);
        }
      });
    },
    [itemID, library, ossData]
  );

  const executeOperation = useCallback(
    (data: ITargetOperation, callback?: () => void) => {
      if (!ossData.schema) {
        return;
      }
      setProcessingError(undefined);
      postExecuteOperation(itemID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          ossData.setData(newData);
          library.reloadItems(callback);
        }
      });
    },
    [itemID, library, ossData]
  );

  const relocateConstituents = useCallback(
    (data: ICstRelocateData, callback?: () => void) => {
      if (!ossData.schema) {
        return;
      }
      setProcessingError(undefined);
      postRelocateConstituents({
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: () => {
          ossData.reload();
          library.reloadItems(callback);
        }
      });
    },
    [library, ossData]
  );

  return (
    <OssContext
      value={{
        schema: ossData.schema,
        itemID,
        loading: ossData.loading,
        loadingError: ossData.loadingError,
        processing,
        processingError,
        isOwned,
        update,

        setOwner,
        setEditors,
        setAccessPolicy,
        setLocation,

        savePositions,
        createOperation,
        deleteOperation,
        createInput,
        setInput,
        updateOperation,
        executeOperation,
        relocateConstituents
      }}
    >
      {children}
    </OssContext>
  );
};
