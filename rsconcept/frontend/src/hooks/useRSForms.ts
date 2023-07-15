import { useCallback, useEffect, useState } from 'react'
import { IRSForm } from '../models'
import { ErrorInfo } from '../components/BackendError';
import { getRSForms } from '../backendAPI';

export function useRSForms() {
  const [rsforms, setRSForms] = useState<IRSForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(undefined);

  const fetchData = useCallback(async () => {
    getRSForms({
      showError: true,
      setLoading: setLoading,
      onError: error => setError(error),
      onSucccess: response => setRSForms(response.data)
    });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData])

  return { rsforms, error, loading };
}