'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { getRSFormDetails } from '@/backend/rsforms';
import { type ErrorData } from '@/components/info/InfoError';
import { LibraryItemID } from '@/models/library';
import { ConstituentaID, IRSForm, IRSFormData } from '@/models/rsform';
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

  const getSchema = useCallback((id: LibraryItemID) => cache.find(item => item.id === id), [cache]);

  const getSchemaByCst = useCallback(
    (id: ConstituentaID) => {
      for (const schema of cache) {
        const cst = schema.items.find(cst => cst.id === id);
        if (cst) {
          return schema;
        }
      }
      return undefined;
    },
    [cache]
  );

  const getConstituenta = useCallback(
    (id: ConstituentaID) => {
      for (const schema of cache) {
        const cst = schema.items.find(cst => cst.id === id);
        if (cst) {
          return cst;
        }
      }
      return undefined;
    },
    [cache]
  );

  const preload = useCallback(
    (target: LibraryItemID[]) => setPending(prev => [...prev, ...target.filter(id => !prev.includes(id))]),
    []
  );

  useEffect(() => {
    const ids = pending.filter(id => !processing.includes(id) && !cache.find(schema => schema.id === id));
    if (ids.length === 0) {
      return;
    }
    setProcessing(prev => [...prev, ...ids]);
    setPending([]);
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
  }, [pending]);

  return { preload, getSchema, getConstituenta, getSchemaByCst, loading, error, setError };
}

export default useRSFormCache;
