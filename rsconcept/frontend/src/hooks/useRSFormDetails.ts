import { useCallback, useEffect, useState } from 'react'
import { IRSForm } from '../models'
import { ErrorInfo } from '../components/BackendError';
import { getRSFormDetails } from '../backendAPI';

export function useRSFormDetails({target}: {target?: string}) {
  const [schema, setSchema] = useState<IRSForm | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(undefined);

  const fetchData = useCallback(async () => {
    setError(undefined);
    setSchema(undefined);
    if (!target) {
      return;
    }
    getRSFormDetails(target, {
      showError: true,
      setLoading: setLoading,
      onError: error => setError(error),
      onSucccess: response => setSchema(response.data)
    });
  }, [target]);

  async function reload() {
    fetchData()
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { schema, reload, error, setError, loading };
}