import { useCallback, useEffect, useState } from 'react'

import { type ErrorInfo } from '../components/BackendError'
import { getProfile } from '../utils/backendAPI'
import { type IUserProfile } from '../utils/models'

export function useUserProfile() {
  const [user, setUser] = useState<IUserProfile | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(undefined);

  const fetchUser = useCallback(
    async () => {
      setError(undefined);
      setUser(undefined);
      await getProfile({
        showError: true,
        setLoading,
        onError: error => { setError(error); },
        onSucccess: response => { setUser(response.data); }
      });
    }, [setUser]
  )

  useEffect(() => {
    fetchUser().catch((error) => { setError(error); });
  }, [fetchUser])

  return { user, fetchUser, error, loading };
}
