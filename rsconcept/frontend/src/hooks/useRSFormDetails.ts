import axios from 'axios'
import { config } from '../constants';
import { useCallback, useEffect, useState } from 'react'
import { IRSForm } from '../models'
import { ErrorInfo } from '../components/BackendError';

export function useRSFormDetails({target}: {target?: string}) {
  const [schema, setSchema] = useState<IRSForm | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(undefined);

  const fetchData = useCallback(async () => {
    console.log(`Requesting rsform ${target}`);
    setError(undefined);
    setSchema(undefined);
    if (!target) {
      return;
    }
    setLoading(true);
    axios.get<IRSForm>(`${config.url.BASE}rsforms/${target}/details/`)
    .then(function (response) {
      setLoading(false);
      setSchema(response.data);
    })
    .catch(function (error) {
      setLoading(false);
      setError(error);
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