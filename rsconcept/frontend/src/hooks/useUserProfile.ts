import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { IUserProfile } from '../models'
import { config } from '../constants'
import { ErrorInfo } from '../components/BackendError'


export function useUserProfile() {
  const [user, setUser] = useState<IUserProfile | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(undefined);
  
  const fetchUser = useCallback(
    async () => {
      setError(undefined);
      setLoading(true);
      console.log('Profile requested');
      axios.get<IUserProfile>(`${config.url.AUTH}profile`)
      .then(function (response) {
        setLoading(false);
        setUser(response.data);
      })
      .catch(function (error) {
        setLoading(false);
        setUser(undefined);
        setError(error);
      });
    }, [setUser]
  )

  useEffect(() => {
    fetchUser();
  }, [fetchUser])

  return { user, fetchUser, error, loading };
}