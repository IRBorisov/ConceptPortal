import { useCallback, useState } from 'react'

import { type ErrorInfo } from '../components/BackendError';
import { DataCallback, postCheckExpression } from '../utils/backendAPI';
import { ExpressionParse, type IRSForm } from '../utils/models';

function useCheckExpression({ schema }: { schema?: IRSForm }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(undefined);
  const [parseData, setParseData] = useState<ExpressionParse | undefined>(undefined);

  const resetParse = useCallback(() => { setParseData(undefined); }, []);

  function checkExpression(expression: string, onSuccess?: DataCallback<ExpressionParse>) {
    setError(undefined);
    setParseData(undefined);
    postCheckExpression(String(schema?.id), {
      data: { expression: expression },
      showError: true,
      setLoading,
      onError: error => { setError(error); },
      onSuccess: newData => {
        setParseData(newData);
        if (onSuccess) onSuccess(newData);
      }
    });
  }

  return { parseData, checkExpression, resetParse, error, setError, loading };
}

export default useCheckExpression;
