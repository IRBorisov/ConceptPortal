import { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { IConstituenta, IRSForm } from '../models';
import { useRSFormDetails } from '../hooks/useRSFormDetails';
import { ErrorInfo } from '../components/BackendError';
import { useAuth } from './AuthContext';
import axios from 'axios';
import { config } from '../constants';

interface IRSFormContext {
  schema?: IRSForm
  active?: IConstituenta
  error: ErrorInfo
  loading: boolean
  processing: boolean
  isEditable: boolean
  isClaimable: boolean
  
  setActive: (cst: IConstituenta) => void
  reload: () => void
  upload: (data: any, callback: Function) => void
  destroy: (callback: Function) => void
  claim: (callback: Function) => void
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
  upload: () => {},
  destroy: () => {},
  claim: () => {},
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

  useEffect(() => {
    if (schema?.items && schema?.items.length > 0) {
      setActive(schema?.items[0]);
    }
  }, [schema])

  async function upload(data: any, callback?: Function) {
    console.log(`Update rsform with ${data}`);
    data['id'] = {id}
    setError(undefined);
    setProcessing(true);
    axios.patch(`${config.url.BASE}rsforms/${id}/`, data)
    .then(function (response) {
      setProcessing(false);
      if (callback) callback(response.data);
    })
    .catch(function (error) {
      setProcessing(false);
      setError(error);
    });
  }

  async function destroy(callback?: Function) {
    console.log(`Deleting rsform ${id}`);
    setError(undefined);
    setProcessing(true);
    axios.delete(`${config.url.BASE}rsforms/${id}/`)
    .then(function (response) {
      setProcessing(false);
      if (callback) callback();
    })
    .catch(function (error) {
      setProcessing(false);
      setError(error);
    });
  }

  async function claim(callback?: Function) {
    console.log(`Claiming rsform ${id}`);
    setError(undefined);
    setProcessing(true);
    axios.post(`${config.url.BASE}rsforms/${id}/claim/`)
    .then(function (response) {
      setProcessing(false);
      if (callback) callback();
    })
    .catch(function (error) {
      setProcessing(false);
      setError(error);
    });
  }

  return (
    <RSFormContext.Provider value={{
      schema, error, loading, processing,
      active, setActive,
      isEditable, isClaimable,
      reload, upload, destroy, claim
    }}>
      { children }
    </RSFormContext.Provider>
  );
}

export const useRSForm = () => useContext(RSFormContext);