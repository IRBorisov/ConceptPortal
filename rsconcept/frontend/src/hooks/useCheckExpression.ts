import { type AxiosResponse } from 'axios';
import { useCallback, useState } from 'react'

import { type ErrorInfo } from '../components/BackendError';
import { postCheckExpression } from '../utils/backendAPI';
import { type IRSForm } from '../utils/models';

function useCheckExpression({ schema }: { schema?: IRSForm }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(undefined);
  const [parseData, setParseData] = useState<any | undefined>(undefined);

  const resetParse = useCallback(() => { setParseData(undefined); }, []);

  async function checkExpression(expression: string, onSuccess?: (response: AxiosResponse) => void) {
    setError(undefined);
    setParseData(undefined);
    await postCheckExpression(String(schema?.id), {
      data: { expression },
      showError: true,
      setLoading,
      onError: error => { setError(error); },
      onSucccess: (response) => {
        setParseData(response.data);
        if (onSuccess) onSuccess(response);
      }
    });
  }

  return { parseData, checkExpression, resetParse, error, setError, loading };
}

export default useCheckExpression;
