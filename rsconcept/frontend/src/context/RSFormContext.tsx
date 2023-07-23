import { createContext, useState, useContext, useMemo, useCallback } from 'react';
import { IConstituenta, IRSForm } from '../utils/models';
import { useRSFormDetails } from '../hooks/useRSFormDetails';
import { ErrorInfo } from '../components/BackendError';
import { useAuth } from './AuthContext';
import { BackendCallback, deleteRSForm, getTRSFile, patchConstituenta, patchRSForm, postClaimRSForm, postDeleteConstituenta, postNewConstituenta } from '../utils/backendAPI';
import { toast } from 'react-toastify';

interface IRSFormContext {
  schema?: IRSForm
  active?: IConstituenta
  error: ErrorInfo
  loading: boolean
  processing: boolean
  isOwned: boolean
  isEditable: boolean
  isClaimable: boolean
  forceAdmin: boolean
  readonly: boolean
  isTracking: boolean
  
  setActive: React.Dispatch<React.SetStateAction<IConstituenta | undefined>>
  toggleForceAdmin: () => void
  toggleReadonly: () => void
  toggleTracking: () => void

  reload: () => Promise<void>
  update: (data: any, callback?: BackendCallback) => Promise<void>
  destroy: (callback?: BackendCallback) => Promise<void>
  claim: (callback?: BackendCallback) => Promise<void>
  download: (callback: BackendCallback) => Promise<void>

  cstUpdate: (data: any, callback?: BackendCallback) => Promise<void>
  cstCreate: (data: any, callback?: BackendCallback) => Promise<void>
  cstDelete: (data: any, callback?: BackendCallback) => Promise<void>
}

export const RSFormContext = createContext<IRSFormContext>({
  schema: undefined,
  active: undefined,
  error: undefined,
  loading: false,
  processing: false,
  isOwned: false,
  isEditable: false,
  isClaimable: false,
  forceAdmin: false,
  readonly: false,
  isTracking: true,
  
  setActive: () => {},
  toggleForceAdmin: () => {},
  toggleReadonly: () => {},
  toggleTracking: () => {},

  reload: async () => {},
  update: async () => {},
  destroy: async () => {},
  claim: async () => {},
  download: async () => {},

  cstUpdate: async () => {},
  cstCreate: async () => {},
  cstDelete: async () => {},
})

interface RSFormStateProps {
  schemaID: string
  children: React.ReactNode
}

export const RSFormState = ({ schemaID, children }: RSFormStateProps) => {
  const { user } = useAuth();
  const { schema, reload, error, setError, loading } = useRSFormDetails({target: schemaID});
  const [processing, setProcessing] = useState(false)
  const [active, setActive] = useState<IConstituenta | undefined>(undefined);

  const [forceAdmin, setForceAdmin] = useState(false);
  const [readonly, setReadonly] = useState(false);

  const isOwned = useMemo(() => user?.id === schema?.owner || false, [user, schema]);
  const isClaimable = useMemo(() => (user?.id !== schema?.owner || false), [user, schema]);
  const isEditable = useMemo(
  () => {
    return (
      !loading && !readonly && 
      (isOwned || (forceAdmin && user?.is_staff) || false)
    )
  }, [user, readonly, forceAdmin, isOwned, loading]);
  
  const isTracking = useMemo(
  () => {
    return true;
  }, []);

  const toggleTracking = useCallback(
  () => {
    toast('not implemented yet');
  }, []);

  const update = useCallback(
  async (data: any, callback?: BackendCallback) => {
    setError(undefined);
    patchRSForm(schemaID, {
      data: data,
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSucccess: callback
    });
  }, [schemaID, setError]);

  const destroy = useCallback(
  async (callback?: BackendCallback) => {
    setError(undefined);
    deleteRSForm(schemaID, {
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSucccess: callback
    });
  }, [schemaID, setError]);

  const claim = useCallback(
  async (callback?: BackendCallback) => {
    setError(undefined);
    postClaimRSForm(schemaID, {
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSucccess: callback
    });
  }, [schemaID, setError]);

  const download = useCallback(
  async (callback: BackendCallback) => {
    setError(undefined);
    getTRSFile(schemaID, {
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSucccess: callback
    });
  }, [schemaID, setError]);

  const cstUpdate = useCallback(
  async (data: any, callback?: BackendCallback) => {
    setError(undefined);
    patchConstituenta(String(active!.entityUID), {
      data: data,
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSucccess: callback
    });
  }, [active, setError]);

  const cstCreate = useCallback(
  async (data: any, callback?: BackendCallback) => {
    setError(undefined);
    postNewConstituenta(schemaID, {
      data: data,
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSucccess: callback
    });
  }, [schemaID, setError]);

  const cstDelete = useCallback(
    async (data: any, callback?: BackendCallback) => {
      setError(undefined);
      postDeleteConstituenta(schemaID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: error => setError(error),
        onSucccess: callback
      });
    }, [schemaID, setError]);

  return (
    <RSFormContext.Provider value={{
      schema, error, loading, processing,
      active, setActive,
      forceAdmin, readonly,
      toggleForceAdmin: () => setForceAdmin(prev => !prev),
      toggleReadonly: () => setReadonly(prev => !prev),
      isOwned, isEditable, isClaimable,
      isTracking, toggleTracking,
      reload, update, download, destroy, claim,
      cstUpdate, cstCreate, cstDelete,
    }}>
      { children }
    </RSFormContext.Provider>
  );
}

export const useRSForm = () => useContext(RSFormContext);