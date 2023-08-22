import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { toast } from 'react-toastify'

import { type ErrorInfo } from '../components/BackendError'
import { useRSFormDetails } from '../hooks/useRSFormDetails'
import {
  type DataCallback, getTRSFile,
  patchConstituenta, patchDeleteConstituenta, 
  patchMoveConstituenta, patchResetAliases, patchRSForm,
  patchUploadTRS,  postClaimRSForm, postNewConstituenta
} from '../utils/backendAPI'
import {
  IConstituentaList, IConstituentaMeta, ICstCreateData,
  ICstMovetoData, ICstUpdateData, IRSForm, 
  IRSFormMeta, IRSFormUpdateData, IRSFormUploadData
} from '../utils/models'
import { useAuth } from './AuthContext'

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
  toggleTracking: () => void
  
  update: (data: IRSFormUpdateData, callback?: DataCallback<IRSFormMeta>) => void
  claim: (callback?: DataCallback<IRSFormMeta>) => void
  download: (callback: DataCallback<Blob>) => void
  upload: (data: IRSFormUploadData, callback: () => void) => void

  resetAliases: (callback: () => void) => void

  cstCreate: (data: ICstCreateData, callback?: DataCallback<IConstituentaMeta>) => void
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
  const { user } = useAuth();
  const { schema, reload, error, setError, setSchema, loading } = useRSFormDetails({ target: schemaID });
  const [ processing, setProcessing ] = useState(false);

  const [ isForceAdmin, setIsForceAdmin ] = useState(false);
  const [ isReadonly, setIsReadonly ] = useState(false);

  const isOwned = useMemo(() => user?.id === schema?.owner || false, [user, schema?.owner]);
  const isClaimable = useMemo(() => user?.id !== schema?.owner || false, [user, schema?.owner]);
  const isEditable = useMemo(
    () => {
      return (
        !loading && !processing && !isReadonly &&
      ((isOwned || (isForceAdmin && user?.is_staff)) ?? false)
      )
    }, [user?.is_staff, isReadonly, isForceAdmin, isOwned, loading, processing])

  const isTracking = useMemo(
    () => {
      return true
    }, []);

  const toggleTracking = useCallback(
    () => {
      toast.info('Отслеживание в разработке...')
    }, []);

  const update = useCallback(
  (data: IRSFormUpdateData, callback?: DataCallback<IRSFormMeta>) => {
    if (!schema) {
      return;
    }
    setError(undefined)
    patchRSForm(schemaID, {
      data: data,
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSuccess: newData => {
        setSchema(Object.assign(schema, newData));
        if (callback) callback(newData);
      }
    });
  }, [schemaID, setError, setSchema, schema]);
  
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
        if (callback) callback();
      }
    });
  }, [schemaID, setError, setSchema, schema]);

  const claim = useCallback(
  (callback?: DataCallback<IRSFormMeta>) => {
    if (!schema || !user) {
      return;
    }
    setError(undefined)
    postClaimRSForm(schemaID, {
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSuccess: newData => {
        setSchema(Object.assign(schema, newData));
        if (callback) callback(newData);
      }
    });
  }, [schemaID, setError, schema, user, setSchema]);

  const resetAliases = useCallback(
  (callback?: () => void) => {
    if (!schema || !user) {
      return;
    }
    setError(undefined)
    patchResetAliases(schemaID, {
      showError: true,
      setLoading: setProcessing,
      onError: error => { setError(error) },
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
      onError: error => { setError(error) },
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
      onError: error => { setError(error) },
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
      onError: error => { setError(error) },
      onSuccess: newData => {
        setSchema(newData);
        if (callback) callback();
      }
    });
  }, [schemaID, setError, setSchema]);

  const cstUpdate = useCallback(
  (data: ICstUpdateData, callback?: DataCallback<IConstituentaMeta>) => {
    setError(undefined)
    patchConstituenta(data.id, {
      data: data,
      showError: true,
      setLoading: setProcessing,
      onError: error => { setError(error) },
      onSuccess: newData => {
        reload(setProcessing, () => { if (callback != null) callback(newData); })
      }
    });
  }, [setError, reload]);

  const cstMoveTo = useCallback(
  (data: ICstMovetoData, callback?: () => void) => {
    setError(undefined)
    patchMoveConstituenta(schemaID, {
      data: data,
      showError: true,
      setLoading: setProcessing,
      onError: error => { setError(error) },
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
      toggleForceAdmin: () => { setIsForceAdmin(prev => !prev) },
      toggleReadonly: () => { setIsReadonly(prev => !prev) },
      toggleTracking,
      update, download, upload, claim, resetAliases,
      cstUpdate, cstCreate, cstDelete, cstMoveTo
    }}>
      { children }
    </RSFormContext.Provider>
  );
}
