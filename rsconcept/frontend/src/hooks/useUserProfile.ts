import { useCallback, useEffect, useState } from 'react'
import { IUserProfile } from '../models'
import { ErrorInfo } from '../components/BackendError'
import { getProfile } from '../backendAPI'


export function useUserProfile() {
  const [user, setUser] = useState<IUserProfile | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(undefined);
  
  const fetchUser = useCallback(
    async () => {
      setError(undefined);
      setUser(undefined);
      getProfile({
        showError: true,
        setLoading: setLoading,
        onError: error => setError(error),
        onSucccess: response => setUser(response.data)
      });
    }, [setUser]
  )

  useEffect(() => {
    fetchUser();
  }, [fetchUser])

  return { user, fetchUser, error, loading };
}