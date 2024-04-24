'use client';

import { useCallback, useState } from 'react';

import { ErrorData } from '@/components/info/InfoError';
import { IResolutionData } from '@/models/language';
import { IRSForm } from '@/models/rsform';
import { DataCallback, postResolveText } from '@/app/backendAPI';

function useResolveText({ schema }: { schema?: IRSForm }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorData>(undefined);
  const [refsData, setRefsData] = useState<IResolutionData | undefined>(undefined);

  const resetData = useCallback(() => setRefsData(undefined), []);

  function resolveText(text: string, onSuccess?: DataCallback<IResolutionData>) {
    setError(undefined);
    postResolveText(String(schema!.id), {
      data: { text: text },
      showError: true,
      setLoading,
      onError: setError,
      onSuccess: data => {
        setRefsData(data);
        if (onSuccess) onSuccess(data);
      }
    });
  }

  return { refsData, resolveText, resetData, error, setError, loading };
}

export default useResolveText;
