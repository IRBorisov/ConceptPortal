import { useCallback, useState } from 'react'

import { type ErrorInfo } from '../components/BackendError';
import { DataCallback, postCheckExpression } from '../utils/backendAPI';
import { IExpressionParse, type IRSForm } from '../utils/models';

function useCheckExpression({ schema }: { schema?: IRSForm }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(undefined);
  const [parseData, setParseData] = useState<IExpressionParse | undefined>(undefined);

  const resetParse = useCallback(() => { setParseData(undefined); }, []);

  function checkExpression(expression: string, onSuccess?: DataCallback<IExpressionParse>) {
    setError(undefined);
    postCheckExpression(schema!.id, {
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
