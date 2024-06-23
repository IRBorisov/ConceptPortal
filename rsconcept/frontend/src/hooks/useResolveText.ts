'use client';

import { useCallback, useState } from 'react';

import { DataCallback, postResolveText } from '@/app/backendAPI';
import { ErrorData } from '@/components/info/InfoError';
import { IResolutionData } from '@/models/language';
import { IRSForm } from '@/models/rsform';

function useResolveText({ schema }: { schema?: IRSForm }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<ErrorData>(undefined);
  const [refsData, setRefsData] = useState<IResolutionData | undefined>(undefined);

  const resetData = useCallback(() => setRefsData(undefined), []);

  function resolveText(text: string, onSuccess?: DataCallback<IResolutionData>) {
    setError(undefined);
    postResolveText(String(schema!.id), {
      data: { text: text },
      showError: true,
      setLoading: setProcessing,
      onError: setError,
      onSuccess: data => {
        setRefsData(data);
        if (onSuccess) onSuccess(data);
      }
    });
  }

  return { refsData, resolveText, resetData, error, setError, processing };
}

export default useResolveText;
