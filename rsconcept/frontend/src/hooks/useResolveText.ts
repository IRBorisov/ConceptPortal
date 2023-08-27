import { useCallback, useState } from 'react'

import { ErrorInfo } from '../components/BackendError';
import { DataCallback, postResolveText } from '../utils/backendAPI';
import { IReferenceData,IRSForm } from '../utils/models';

function useResolveText({ schema }: { schema?: IRSForm }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(undefined);
  const [refsData, setRefsData] = useState<IReferenceData | undefined>(undefined);

  const resetData = useCallback(() => setRefsData(undefined), []);

  function resolveText(text: string, onSuccess?: DataCallback<IReferenceData>) {
    setError(undefined);
    postResolveText(String(schema!.id), {
      data: { text: text },
      showError: true,
      setLoading,
      onError: error => setError(error),
      onSuccess: data => {
        setRefsData(data);
        if (onSuccess) onSuccess(data);
      }
    });
  }

  return { refsData, resolveText, resetData, error, setError, loading };
}

export default useResolveText;
