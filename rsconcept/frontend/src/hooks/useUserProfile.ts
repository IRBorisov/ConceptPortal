import { useCallback, useEffect, useState } from 'react'

import { type ErrorInfo } from '../components/BackendError'
import { DataCallback, getProfile, patchProfile } from '../utils/backendAPI'
import { type IUserProfile,IUserUpdateData } from '../utils/models'

export function useUserProfile() {
  const [user, setUser] = useState<IUserProfile | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(undefined);

  const reload = useCallback(
    () => {
      setError(undefined);
      setUser(undefined);
      getProfile({
        showError: true,
        setLoading: setLoading,
        onError: error => { setError(error); },
        onSuccess: newData => { setUser(newData); }
      });
    }, [setUser]
  )
  const updateUser = useCallback(
    (data: IUserUpdateData, callback?: DataCallback<IUserProfile>) => {
      setError(undefined);
      patchProfile({
        data: data,
        showError: true,
        setLoading: setLoading,
        onError: error => { setError(error); },
        onSuccess: newData => {
          setUser(newData);
          if (callback) callback(newData);
        }
      });
    }, [setUser]
  );

  useEffect(() => {
    reload();
  }, [reload])

  return { user, updateUser, error, loading };
}
