import { useCallback, useState } from 'react'
import { ErrorInfo } from '../components/BackendError';
import { postCheckExpression } from '../utils/backendAPI';
import { IRSForm } from '../utils/models';
import { AxiosResponse } from 'axios';

function useCheckExpression({schema}: {schema?: IRSForm}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(undefined);
  const [parseData, setParseData] = useState<any | undefined>(undefined);

  const resetParse = useCallback(() => setParseData(undefined), []);
  
  async function checkExpression(expression: string, onSuccess?: (response: AxiosResponse) => void) {
    setError(undefined);
    setParseData(undefined);
    postCheckExpression(String(schema!.id), {
      data: {'expression': expression},
      showError: true,
      setLoading: setLoading,
      onError: error => setError(error),
      onSucccess: (response) => {
        setParseData(response.data);
        if (onSuccess) onSuccess(response);
      }
    });
  }

  return { parseData, checkExpression, resetParse, error, setError, loading };
}

export default useCheckExpression;