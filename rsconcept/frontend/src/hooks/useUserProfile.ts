import { useCallback, useEffect, useState } from 'react'

import { type ErrorInfo } from '../components/BackendError'
import { getProfile } from '../utils/backendAPI'
import { type IUserProfile } from '../utils/models'

export function useUserProfile() {
  const [user, setUser] = useState<IUserProfile | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(undefined);

  const fetchUser = useCallback(
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

  useEffect(() => {
    fetchUser();
  }, [fetchUser])

  return { user, fetchUser, error, loading };
}
