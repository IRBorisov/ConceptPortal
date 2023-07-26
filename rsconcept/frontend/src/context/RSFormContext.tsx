import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { toast } from 'react-toastify'

import { type ErrorInfo } from '../components/BackendError'
import { useRSFormDetails } from '../hooks/useRSFormDetails'
import {
  type DataCallback, deleteRSForm, getTRSFile,
  patchConstituenta, patchDeleteConstituenta, patchMoveConstituenta, patchRSForm,
  postClaimRSForm, postNewConstituenta
} from '../utils/backendAPI'
import {
  IConstituenta, IConstituentaList, IConstituentaMeta, ICstCreateData,
  ICstMovetoData, ICstUpdateData, IRSForm, IRSFormMeta, IRSFormUpdateData
} from '../utils/models'
import { useAuth } from './AuthContext'

interface IRSFormContext {
  schema?: IRSForm
  activeCst?: IConstituenta
  activeID?: number

  error: ErrorInfo
  loading: boolean
  processing: boolean

  isOwned: boolean
  isEditable: boolean
  isClaimable: boolean
  isReadonly: boolean
  isTracking: boolean
  isForceAdmin: boolean

  setActiveID: React.Dispatch<React.SetStateAction<number | undefined>>
  toggleForceAdmin: () => void
  toggleReadonly: () => void
  toggleTracking: () => void

  update: (data: IRSFormUpdateData, callback?: DataCallback<IRSFormMeta>) => void
  destroy: (callback?: DataCallback) => void
  claim: (callback?: DataCallback<IRSFormMeta>) => void
  download: (callback: DataCallback<Blob>) => void

  cstCreate: (data: ICstCreateData, callback?: DataCallback<IConstituentaMeta>) => void
  cstUpdate: (data: ICstUpdateData, callback?: DataCallback<IConstituentaMeta>) => void
  cstDelete: (data: IConstituentaList, callback?: () => void) => void
  cstMoveTo: (data: ICstMovetoData, callback?: () => void) => void
}

const RSFormContext = createContext<IRSFormContext | null>(null)
export const useRSForm = () => {
  const context = useContext(RSFormContext)
  if (context == null) {
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
  const { user } = useAuth()
  const { schema, reload, error, setError, setSchema, loading } = useRSFormDetails({ target: schemaID })
  const [processing, setProcessing] = useState(false)
  const [activeID, setActiveID] = useState<number | undefined>(undefined)

  const [isForceAdmin, setIsForceAdmin] = useState(false)
  const [isReadonly, setIsReadonly] = useState(false)

  const isOwned = useMemo(() => user?.id === schema?.owner || false, [user, schema?.owner])
  const isClaimable = useMemo(() => user?.id !== schema?.owner || false, [user, schema?.owner])
  const isEditable = useMemo(
    () => {
      return (
        !loading && !isReadonly &&
      ((isOwned || (isForceAdmin && user?.is_staff)) ?? false)
      )
    }, [user?.is_staff, isReadonly, isForceAdmin, isOwned, loading])

  const activeCst = useMemo(
    () => {
      return schema?.items?.find((cst) => cst.id === activeID)
    }, [schema?.items, activeID])

  const isTracking = useMemo(
    () => {
      return true
    }, [])

  const toggleTracking = useCallback(
    () => {
      toast('not implemented yet')
    }, [])

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
        onError: error => { setError(error) },
        onSuccess: newData => {
          setSchema(Object.assign(schema, newData));
          if (callback) callback(newData);
        }
      });
    }, [schemaID, setError, setSchema, schema])

  const destroy = useCallback(
    (callback?: DataCallback) => {
      setError(undefined)
      deleteRSForm(schemaID, {
        showError: true,
        setLoading: setProcessing,
        onError: error => { setError(error) },
        onSuccess: newData => {
          setSchema(undefined);
          if (callback) callback(newData);
        }
      });
    }, [schemaID, setError, setSchema])

  const claim = useCallback(
    (callback?: DataCallback<IRSFormMeta>) => {
      if (!schema || !user) {
        return;
      }
      setError(undefined)
      postClaimRSForm(schemaID, {
        showError: true,
        setLoading: setProcessing,
        onError: error => { setError(error) },
        onSuccess: newData => {
          setSchema(Object.assign(schema, newData));
          if (callback) callback(newData);
        }
      });
    }, [schemaID, setError, schema, user, setSchema])

  const download = useCallback(
    (callback: DataCallback<Blob>) => {
      setError(undefined)
      getTRSFile(schemaID, {
        showError: true,
        setLoading: setProcessing,
        onError: error => { setError(error) },
        onSuccess: callback
      });
    }, [schemaID, setError])

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
      patchConstituenta(String(data.id), {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: error => { setError(error) },
        onSuccess: newData => {
          reload(setProcessing, () => { if (callback != null) callback(newData); })
        }
      });
    }, [setError, reload])

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
      error,
      loading,
      processing,
      activeID,
      activeCst,
      setActiveID,
      isForceAdmin,
      isReadonly,
      toggleForceAdmin: () => { setIsForceAdmin(prev => !prev) },
      toggleReadonly: () => { setIsReadonly(prev => !prev) },
      isOwned,
      isEditable,
      isClaimable,
      isTracking,
      toggleTracking,
      update,
      download,
      destroy,
      claim,
      cstUpdate,
      cstCreate,
      cstDelete,
      cstMoveTo
    }}>
      { children }
    </RSFormContext.Provider>
  )
}
