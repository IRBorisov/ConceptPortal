import { createContext, useState, useContext, useMemo } from 'react';
import { IConstituenta, IRSForm } from '../models';
import { useRSFormDetails } from '../hooks/useRSFormDetails';
import { ErrorInfo } from '../components/BackendError';
import { useAuth } from './AuthContext';
import { BackendCallback, deleteRSForm, getTRSFile, patchConstituenta, patchRSForm, postClaimRSForm } from '../backendAPI';

interface IRSFormContext {
  schema?: IRSForm
  active?: IConstituenta
  error: ErrorInfo
  loading: boolean
  processing: boolean
  isEditable: boolean
  isClaimable: boolean
  
  setActive: (cst: IConstituenta | undefined) => void
  reload: () => void
  update: (data: any, callback?: BackendCallback) => void
  destroy: (callback: BackendCallback) => void
  claim: (callback: BackendCallback) => void
  download: (callback: BackendCallback) => void

  cstUpdate: (data: any, callback: BackendCallback) => void
}

export const RSFormContext = createContext<IRSFormContext>({
  schema: undefined,
  active: undefined,
  error: undefined,
  loading: false,
  processing: false,
  isEditable: false,
  isClaimable: false,
  
  setActive: () => {},
  reload: () => {},
  update: () => {},
  destroy: () => {},
  claim: () => {},
  download: () => {},

  cstUpdate: () => {},
})

interface RSFormStateProps {
  id: string
  children: React.ReactNode
}

export const RSFormState = ({ id, children }: RSFormStateProps) => {
  const { user } = useAuth();
  const { schema, reload, error, setError, loading } = useRSFormDetails({target: id});
  const [processing, setProcessing] = useState(false)
  const [active, setActive] = useState<IConstituenta | undefined>(undefined);

  const isEditable = useMemo(() => (user?.id === schema?.owner || user?.is_staff || false), [user, schema]);
  const isClaimable = useMemo(() => (user?.id !== schema?.owner || false), [user, schema]);

  async function update(data: any, callback?: BackendCallback) {
    setError(undefined);
    patchRSForm(id, {
      data: data,
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSucccess: callback
    });
  }

  async function destroy(callback: BackendCallback) {
    setError(undefined);
    deleteRSForm(id, {
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSucccess: callback
    });
  }

  async function claim(callback: BackendCallback) {
    setError(undefined);
    postClaimRSForm(id, {
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSucccess: callback
    });
  }

  async function download(callback: BackendCallback) {
    setError(undefined);
    getTRSFile(id, {
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSucccess: callback
    });
  }

  async function cstUpdate(data: any, callback?: BackendCallback) {
    setError(undefined);
    patchConstituenta(String(active!.entityUID), {
      data: data,
      showError: true,
      setLoading: setProcessing,
      onError: error => setError(error),
      onSucccess: callback
    });
  }

  return (
    <RSFormContext.Provider value={{
      schema, error, loading, processing,
      active, setActive,
      isEditable, isClaimable,
      cstUpdate, 
      reload, update, download, destroy, claim
    }}>
      { children }
    </RSFormContext.Provider>
  );
}

export const useRSForm = () => useContext(RSFormContext);