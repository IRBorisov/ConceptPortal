import { useCallback, useEffect, useState } from 'react'
import { CalculateStats, IRSForm } from '../utils/models'
import { ErrorInfo } from '../components/BackendError';
import { getRSFormDetails } from '../utils/backendAPI';

export function useRSFormDetails({target}: {target?: string}) {
  const [schema, setInnerSchema] = useState<IRSForm | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(undefined);

  function setSchema(schema?: IRSForm) {
    if (schema) CalculateStats(schema);
    setInnerSchema(schema);
    console.log(schema);
  }

  const fetchData = useCallback(
  async () => {
    setError(undefined);
    setInnerSchema(undefined);
    if (!target) {
      return;
    }
    getRSFormDetails(target, {
      showError: true,
      setLoading: setLoading,
      onError: error => setError(error),
      onSucccess: (response) => setSchema(response.data)
    });
  }, [target]);

  async function reload() {
    fetchData();
  }

  useEffect(() => {
    fetchData();
  }, [fetchData])

  return { schema, setSchema, reload, error, setError, loading };
}