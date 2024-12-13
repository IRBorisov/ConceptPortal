'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { getRSFormDetails } from '@/backend/rsforms';
import { type ErrorData } from '@/components/info/InfoError';
import { LibraryItemID } from '@/models/library';
import { IRSForm, IRSFormData } from '@/models/rsform';
import { RSFormLoader } from '@/models/RSFormLoader';

function useRSFormCache() {
  const [cache, setCache] = useState<IRSForm[]>([]);
  const [pending, setPending] = useState<LibraryItemID[]>([]);
  const [processing, setProcessing] = useState<LibraryItemID[]>([]);
  const loading = useMemo(() => pending.length > 0 || processing.length > 0, [pending, processing]);
  const [error, setError] = useState<ErrorData>(undefined);

  function setSchema(data: IRSFormData) {
    const schema = new RSFormLoader(data).produceRSForm();
    setCache(prev => [...prev, schema]);
  }

  const preload = useCallback(
    (target: LibraryItemID[]) => setPending(prev => [...prev, ...target.filter(id => !prev.includes(id))]),
    []
  );

  useEffect(() => {
    if (pending.length === 0) {
      return;
    }
    const ids = pending.filter(id => !processing.includes(id) && !cache.find(schema => schema.id === id));
    setPending([]);
    if (ids.length === 0) {
      return;
    }
    setProcessing(prev => [...prev, ...ids]);
    ids.forEach(id =>
      getRSFormDetails(String(id), '', {
        showError: false,
        onError: error => {
          setProcessing(prev => prev.filter(item => item !== id));
          setError(error);
        },
        onSuccess: data => {
          setProcessing(prev => prev.filter(item => item !== id));
          setSchema(data);
        }
      })
    );
  }, [pending, cache, processing]);

  return { preload, data: cache, loading, error, setError };
}

export default useRSFormCache;
