import { createContext, useState, useContext, useMemo, useCallback } from 'react';
import { IConstituenta, IRSForm } from '../utils/models';
import { useRSFormDetails } from '../hooks/useRSFormDetails';
import { ErrorInfo } from '../components/BackendError';
import { useAuth } from './AuthContext';
import { 
  BackendCallback, deleteRSForm, getTRSFile, 
  patchConstituenta, patchMoveConstituenta, patchRSForm, 
  postClaimRSForm, patchDeleteConstituenta, postNewConstituenta 
} from '../utils/backendAPI';
import { toast } from 'react-toastify';

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

  update: (data: any, callback?: BackendCallback) => Promise<void>
  destroy: (callback?: BackendCallback) => Promise<void>
  claim: (callback?: BackendCallback) => Promise<void>
  download: (callback: BackendCallback) => Promise<void>

  cstUpdate: (data: any, callback?: BackendCallback) => Promise<void>
  cstCreate: (data: any, callback?: BackendCallback) => Promise<void>
  cstDelete: (data: any, callback?: BackendCallback) => Promise<void>
  cstMoveTo: (data: any, callback?: BackendCallback) => Promise<void>
}

const RSFormContext = createContext<IRSFormContext | null>(null);
export const useRSForm = () => {
  const context = useContext(RSFormContext);
  if (!context) {
    throw new Error(
      'useRSForm has to be used within <RSFormState.Provider>'
    );
  }
  return context;
}

interface RSFormStateProps {
  schemaID: string
  children: React.ReactNode
}

export const RSFormState = ({ schemaID, children }: RSFormStateProps) => {
  const { user } = useAuth();
  const { schema, reload, error, setError, setSchema, loading } = useRSFormDetails({target: schemaID});
  const [processing, setProcessing] = useState(false)
  const [activeID, setActiveID] = useState<number | undefined>(undefined);

  const [isForceAdmin, setIsForceAdmin] = useState(false);
  const [isReadonly, setIsReadonly] = useState(false);

  const isOwned = useMemo(() => user?.id === schema?.owner || false, [user, schema?.owner]);
  const isClaimable = useMemo(() => user?.id !== schema?.owner || false, [user, schema?.owner]);
  const isEditable = useMemo(
  () => {
    return (
      !loading && !isReadonly && 
      (isOwned || (isForceAdmin && user?.is_staff) || false)
    )
  }, [user, isReadonly, isForceAdmin, isOwned, loading]);

  const activeCst = useMemo(
  () => {
    return schema?.items && schema?.items.find((cst) => cst.id === activeID);
  }, [schema?.items, activeID]);
  
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
      onSucccess: async (response) => {
        await reload();
        if (callback) callback(response);
      }
    });
  }, [schemaID, setError, reload]);

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
      onSucccess: async (response) => {
        schema!.owner = user!.id
        schema!.time_update = response.data['time_update']
        setSchema(schema)
        if (callback) callback(response);
      }
    });
  }, [schemaID, setError, schema, user, setSchema]);

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
    patchConstituenta(String(activeID), {
      data: data,
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSucccess: callback
    });
  }, [activeID, setError]);

  const cstCreate = useCallback(
  async (data: any, callback?: BackendCallback) => {
    setError(undefined);
    postNewConstituenta(schemaID, {
      data: data,
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSucccess: async (response) => {
        setSchema(response.data['schema']);
        if (callback) callback(response);
      }
    });
  }, [schemaID, setError, setSchema]);

  const cstDelete = useCallback(
    async (data: any, callback?: BackendCallback) => {
      setError(undefined);
      patchDeleteConstituenta(schemaID, {
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: error => setError(error),
        onSucccess: async (response) => {
          setSchema(response.data);
          if (callback) callback(response);
        }
      });
    }, [schemaID, setError, setSchema]);

    const cstMoveTo = useCallback(
      async (data: any, callback?: BackendCallback) => {
        setError(undefined);
        patchMoveConstituenta(schemaID, {
          data: data,
          showError: true,
          setLoading: setProcessing,
          onError: error => setError(error),
          onSucccess: (response) => {
            setSchema(response.data);
            if (callback) callback(response);
          }
        });
      }, [schemaID, setError, setSchema]);

  return (
    <RSFormContext.Provider value={{
      schema, error, loading, processing,
      activeID, activeCst,
      setActiveID,
      isForceAdmin, isReadonly,
      toggleForceAdmin: () => setIsForceAdmin(prev => !prev),
      toggleReadonly: () => setIsReadonly(prev => !prev),
      isOwned, isEditable, isClaimable,
      isTracking, toggleTracking,
      update, download, destroy, claim,
      cstUpdate, cstCreate, cstDelete, cstMoveTo,
    }}>
      { children }
    </RSFormContext.Provider>
  );
}