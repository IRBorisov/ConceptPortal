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
  const oss = useGlobalOss();
  const model = oss.schema;
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<ErrorData>(undefined);

  const isOwned = useMemo(() => {
    return user?.id === model?.owner || false;
  }, [user, model?.owner]);

  useEffect(() => {
    oss.setID(itemID);
  }, [itemID, oss]);

  const update = useCallback(
    (data: ILibraryUpdateData, callback?: DataCallback<ILibraryItem>) => {
      if (!model) {
        return;
      }
      setProcessingError(undefined);
      patchLibraryItem(itemID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          const fullData: IOperationSchemaData = Object.assign(model, newData);
          oss.setData(fullData);
          library.localUpdateItem(newData);
          if (callback) callback(newData);
        }
      });
    },
    [itemID, model, library, oss]
  );

  const setOwner = useCallback(
    (newOwner: UserID, callback?: () => void) => {
      if (!model) {
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
          model.owner = newOwner;
          library.reloadItems(() => {
            if (callback) callback();
          });
        }
      });
    },
    [itemID, model, library]
  );

  const setAccessPolicy = useCallback(
    (newPolicy: AccessPolicy, callback?: () => void) => {
      if (!model) {
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
          model.access_policy = newPolicy;
          library.reloadItems(() => {
            if (callback) callback();
          });
        }
      });
    },
    [itemID, model, library]
  );

  const setLocation = useCallback(
    (newLocation: string, callback?: () => void) => {
      if (!model) {
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
          model.location = newLocation;
          library.reloadItems(() => {
            if (callback) callback();
          });
        }
      });
    },
    [itemID, model, library]
  );

  const setEditors = useCallback(
    (newEditors: UserID[], callback?: () => void) => {
      if (!model) {
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
          model.editors = newEditors;
          library.reloadItems(() => {
            if (callback) callback();
          });
        }
      });
    },
    [itemID, model, library]
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
    (data: IOperationCreateData, callback?: DataCallback<IOperationData>) => {
      setProcessingError(undefined);
      postCreateOperation(itemID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          oss.setData(newData.oss);
          library.localUpdateTimestamp(newData.oss.id);
          if (callback) callback(newData.new_operation);
        }
      });
    },
    [itemID, library, oss]
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
          oss.setData(newData);
          library.reloadItems(() => {
            if (callback) callback();
          });
        }
      });
    },
    [itemID, library, oss]
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
          oss.setData(newData.oss);
          library.reloadItems(() => {
            if (callback) callback(newData.new_schema);
          });
        }
      });
    },
    [itemID, library, oss]
  );

  const setInput = useCallback(
    (data: IOperationSetInputData, callback?: () => void) => {
      if (!model) {
        return;
      }
      setProcessingError(undefined);
      patchSetInput(itemID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          oss.setData(newData);
          library.reloadItems(() => {
            if (callback) callback();
          });
        }
      });
    },
    [itemID, model, library, oss]
  );

  const updateOperation = useCallback(
    (data: IOperationUpdateData, callback?: () => void) => {
      if (!model) {
        return;
      }
      setProcessingError(undefined);
      patchUpdateOperation(itemID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          oss.setData(newData);
          library.reloadItems(() => {
            if (callback) callback();
          });
        }
      });
    },
    [itemID, model, library, oss]
  );

  const executeOperation = useCallback(
    (data: ITargetOperation, callback?: () => void) => {
      if (!model) {
        return;
      }
      setProcessingError(undefined);
      postExecuteOperation(itemID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          oss.setData(newData);
          library.reloadItems(() => {
            if (callback) callback();
          });
        }
      });
    },
    [itemID, model, library, oss]
  );

  const relocateConstituents = useCallback(
    (data: ICstRelocateData, callback?: () => void) => {
      if (!model) {
        return;
      }
      setProcessingError(undefined);
      postRelocateConstituents({
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: () => {
          oss.reload();
          library.reloadItems(() => {
            if (callback) callback();
          });
        }
      });
    },
    [model, library, oss]
  );

  return (
    <OssContext.Provider
      value={{
        schema: model,
        itemID,
        loading: oss.loading,
        loadingError: oss.loadingError,
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
    </OssContext.Provider>
  );
};
