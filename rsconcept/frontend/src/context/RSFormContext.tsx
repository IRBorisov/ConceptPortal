import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { toast } from 'react-toastify'

import { type ErrorInfo } from '../components/BackendError'
import { useRSFormDetails } from '../hooks/useRSFormDetails'
import {
  type BackendCallback, deleteRSForm, getTRSFile,
  patchConstituenta, patchDeleteConstituenta, patchMoveConstituenta, patchRSForm,
  postClaimRSForm, postNewConstituenta
} from '../utils/backendAPI'
import { type IConstituenta, type IRSForm } from '../utils/models'
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

  update: (data: any, callback?: BackendCallback) => void
  destroy: (callback?: BackendCallback) => void
  claim: (callback?: BackendCallback) => void
  download: (callback: BackendCallback) => void

  cstUpdate: (data: any, callback?: BackendCallback) => void
  cstCreate: (data: any, callback?: BackendCallback) => void
  cstDelete: (data: any, callback?: BackendCallback) => void
  cstMoveTo: (data: any, callback?: BackendCallback) => void
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
    }, [user, isReadonly, isForceAdmin, isOwned, loading])

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
    (data: any, callback?: BackendCallback) => {
      setError(undefined)
      patchRSForm(schemaID, {
        data,
        showError: true,
        setLoading: setProcessing,
        onError: error => { setError(error) },
        onSucccess: (response) => {
          reload()
          .then(() => { if (callback != null) callback(response); })
          .catch(console.error);
        }
      }).catch(console.error);
    }, [schemaID, setError, reload])

  const destroy = useCallback(
    (callback?: BackendCallback) => {
      setError(undefined)
      deleteRSForm(schemaID, {
        showError: true,
        setLoading: setProcessing,
        onError: error => { setError(error) },
        onSucccess: callback
      }).catch(console.error);
    }, [schemaID, setError])

  const claim = useCallback(
    (callback?: BackendCallback) => {
      if (!schema || !user) {
        return;
      }
      setError(undefined)
      postClaimRSForm(schemaID, {
        showError: true,
        setLoading: setProcessing,
        onError: error => { setError(error) },
        onSucccess: (response) => {
          schema.owner = user.id
          schema.time_update = response.data.time_update
          setSchema(schema)
          if (callback != null) callback(response)
        }
      }).catch(console.error);
    }, [schemaID, setError, schema, user, setSchema])

  const download = useCallback(
    (callback: BackendCallback) => {
      setError(undefined)
      getTRSFile(schemaID, {
        showError: true,
        setLoading: setProcessing,
        onError: error => { setError(error) },
        onSucccess: callback
      }).catch(console.error);
    }, [schemaID, setError])

  const cstUpdate = useCallback(
    (data: any, callback?: BackendCallback) => {
      setError(undefined)
      patchConstituenta(String(activeID), {
        data,
        showError: true,
        setLoading: setProcessing,
        onError: error => { setError(error) },
        onSucccess: callback
      }).catch(console.error);
    }, [activeID, setError])

  const cstCreate = useCallback(
    (data: any, callback?: BackendCallback) => {
      setError(undefined)
      postNewConstituenta(schemaID, {
        data,
        showError: true,
        setLoading: setProcessing,
        onError: error => { setError(error) },
        onSucccess: (response) => {
          setSchema(response.data.schema)
          if (callback != null) callback(response)
        }
      }).catch(console.error);
    }, [schemaID, setError, setSchema])

  const cstDelete = useCallback(
    (data: any, callback?: BackendCallback) => {
      setError(undefined)
      patchDeleteConstituenta(schemaID, {
        data,
        showError: true,
        setLoading: setProcessing,
        onError: error => { setError(error) },
        onSucccess: (response) => {
          setSchema(response.data)
          if (callback != null) callback(response)
        }
      }).catch(console.error);
    }, [schemaID, setError, setSchema])

  const cstMoveTo = useCallback(
    (data: any, callback?: BackendCallback) => {
      setError(undefined)
      patchMoveConstituenta(schemaID, {
        data,
        showError: true,
        setLoading: setProcessing,
        onError: error => { setError(error) },
        onSucccess: (response) => {
          setSchema(response.data)
          if (callback != null) callback(response)
        }
      }).catch(console.error);
    }, [schemaID, setError, setSchema])

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
