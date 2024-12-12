'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { DataCallback } from '@/backend/apiTransport';
import {
  patchLibraryItem,
  patchSetAccessPolicy,
  patchSetEditors,
  patchSetLocation,
  patchSetOwner,
  postCreateVersion
} from '@/backend/library';
import { postFindPredecessor } from '@/backend/oss';
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
  IConstituentaReference,
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
import { useGlobalOss } from './GlobalOssContext';
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

  update: (data: ILibraryUpdateData, callback?: DataCallback<ILibraryItem>) => void;
  download: (callback: DataCallback<Blob>) => void;
  upload: (data: IRSFormUploadData, callback: () => void) => void;

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
  findPredecessor: (data: ITargetCst, callback: (reference: IConstituentaReference) => void) => void;

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
}

export const RSFormState = ({ itemID, versionID, children }: React.PropsWithChildren<RSFormStateProps>) => {
  const library = useLibrary();
  const oss = useGlobalOss();
  const { user } = useAuth();
  const rsData = useRSFormDetails({ target: itemID, version: versionID });
  const [processing, setProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<ErrorData>(undefined);

  const isOwned = useMemo(() => {
    return user?.id === rsData.schema?.owner || false;
  }, [user, rsData.schema?.owner]);

  const isArchive = useMemo(() => !!versionID, [versionID]);

  const update = useCallback(
    (data: ILibraryUpdateData, callback?: DataCallback<ILibraryItem>) => {
      if (!rsData.schema) {
        return;
      }
      setProcessingError(undefined);
      patchLibraryItem(itemID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          rsData.setSchema(Object.assign(rsData.schema!, newData));
          library.localUpdateItem(newData);
          oss.invalidateItem(newData.id);
          callback?.(newData);
        }
      });
    },
    [itemID, rsData, library, oss]
  );

  const upload = useCallback(
    (data: IRSFormUploadData, callback?: () => void) => {
      if (!rsData.schema) {
        return;
      }
      setProcessingError(undefined);
      patchUploadTRS(itemID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          rsData.setSchema(newData);
          library.localUpdateItem(newData);
          callback?.();
        }
      });
    },
    [itemID, rsData, library]
  );

  const setOwner = useCallback(
    (newOwner: UserID, callback?: () => void) => {
      setProcessingError(undefined);
      patchSetOwner(itemID, {
        data: {
          user: newOwner
        },
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: () => {
          rsData.partialUpdate({ owner: newOwner });
          library.localUpdateItem({ id: Number(itemID), owner: newOwner });
          callback?.();
        }
      });
    },
    [itemID, rsData, library]
  );

  const setAccessPolicy = useCallback(
    (newPolicy: AccessPolicy, callback?: () => void) => {
      if (!rsData.schema) {
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
          rsData.partialUpdate({ access_policy: newPolicy });
          library.localUpdateItem({ id: Number(itemID), access_policy: newPolicy });
          callback?.();
        }
      });
    },
    [itemID, rsData, library]
  );

  const setLocation = useCallback(
    (newLocation: string, callback?: () => void) => {
      if (!rsData.schema) {
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
          rsData.partialUpdate({ location: newLocation });
          library.localUpdateItem({ id: Number(itemID), location: newLocation });
          callback?.();
        }
      });
    },
    [itemID, rsData, library]
  );

  const setEditors = useCallback(
    (newEditors: UserID[], callback?: () => void) => {
      if (!rsData.schema) {
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
          rsData.partialUpdate({ editors: newEditors });
          callback?.();
        }
      });
    },
    [itemID, rsData]
  );

  const resetAliases = useCallback(
    (callback?: () => void) => {
      if (!rsData.schema || !user) {
        return;
      }
      setProcessingError(undefined);
      patchResetAliases(itemID, {
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          rsData.setSchema(newData);
          library.localUpdateTimestamp(newData.id);
          oss.invalidateItem(newData.id);
          callback?.();
        }
      });
    },
    [itemID, rsData, user, library, oss]
  );

  const restoreOrder = useCallback(
    (callback?: () => void) => {
      if (!rsData.schema || !user) {
        return;
      }
      setProcessingError(undefined);
      patchRestoreOrder(itemID, {
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          rsData.setSchema(newData);
          library.localUpdateTimestamp(newData.id);
          callback?.();
        }
      });
    },
    [itemID, rsData, user, library]
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
          rsData.setSchema(newData.schema);
          library.localUpdateTimestamp(newData.schema.id);
          oss.invalidateItem(newData.schema.id);
          callback?.(newData.cst_list);
        }
      });
    },
    [rsData, itemID, library, oss]
  );

  const download = useCallback(
    (callback: DataCallback<Blob>) => {
      setProcessingError(undefined);
      getTRSFile(itemID, String(rsData.schema?.version ?? ''), {
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: callback
      });
    },
    [itemID, rsData]
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
          rsData.setSchema(newData.schema);
          library.localUpdateTimestamp(newData.schema.id);
          oss.invalidateItem(newData.schema.id);
          callback?.(newData.new_cst);
        }
      });
    },
    [itemID, rsData, library, oss]
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
          rsData.setSchema(newData);
          library.localUpdateTimestamp(newData.id);
          oss.invalidateItem(newData.id);
          callback?.();
        }
      });
    },
    [itemID, rsData, library, oss]
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
          rsData.reload(setProcessing, () => {
            library.localUpdateTimestamp(Number(itemID));
            oss.invalidateItem(Number(itemID));
            callback?.(newData);
          })
      });
    },
    [itemID, rsData, library, oss]
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
          rsData.setSchema(newData.schema);
          library.localUpdateTimestamp(newData.schema.id);
          oss.invalidateItem(newData.schema.id);
          callback?.(newData.new_cst);
        }
      });
    },
    [rsData, itemID, library, oss]
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
          rsData.setSchema(newData);
          library.localUpdateTimestamp(newData.id);
          oss.invalidateItem(newData.id);
          callback?.();
        }
      });
    },
    [rsData, itemID, library, oss]
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
          rsData.setSchema(newData);
          library.localUpdateTimestamp(Number(itemID));
          callback?.();
        }
      });
    },
    [itemID, rsData, library]
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
          rsData.setSchema(newData.schema);
          library.localUpdateTimestamp(Number(itemID));
          callback?.(newData.version);
        }
      });
    },
    [itemID, rsData, library]
  );

  const findPredecessor = useCallback((data: ITargetCst, callback: (reference: IConstituentaReference) => void) => {
    setProcessingError(undefined);
    postFindPredecessor({
      data: data,
      showError: true,
      setLoading: setProcessing,
      onError: setProcessingError,
      onSuccess: callback
    });
  }, []);

  const versionUpdate = useCallback(
    (target: number, data: IVersionData, callback?: () => void) => {
      setProcessingError(undefined);
      patchVersion(String(target), {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: () => {
          const newVersions = rsData.schema!.versions.map(prev => {
            if (prev.id === target) {
              prev.description = data.description;
              prev.version = data.version;
              return prev;
            } else {
              return prev;
            }
          });
          rsData.partialUpdate({ versions: newVersions });
          callback?.();
        }
      });
    },
    [rsData]
  );

  const versionDelete = useCallback(
    (target: number, callback?: () => void) => {
      setProcessingError(undefined);
      deleteVersion(String(target), {
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: () => {
          const newVersions = rsData.schema!.versions.filter(prev => prev.id !== target);
          rsData.partialUpdate({ versions: newVersions });
          callback?.();
        }
      });
    },
    [rsData]
  );

  const versionRestore = useCallback(
    (target: string, callback?: () => void) => {
      setProcessingError(undefined);
      patchRestoreVersion(target, {
        showError: true,
        setLoading: setProcessing,
        onError: setProcessingError,
        onSuccess: newData => {
          rsData.setSchema(newData);
          library.localUpdateItem(newData);
          callback?.();
        }
      });
    },
    [rsData, library]
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
          rsData.setSchema(newData);
          library.localUpdateTimestamp(newData.id);
          oss.invalidateItem(newData.id);
          callback?.(newData);
        }
      });
    },
    [rsData, library, oss]
  );

  return (
    <RSFormContext.Provider
      value={{
        schema: rsData.schema,
        itemID,
        versionID,
        loading: rsData.loading,
        errorLoading: rsData.error,
        processing,
        processingError,
        isOwned,
        isArchive,
        update,
        download,
        upload,
        restoreOrder,
        resetAliases,
        produceStructure,
        inlineSynthesis,
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
        findPredecessor,

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
