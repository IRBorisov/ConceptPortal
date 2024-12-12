'use client';

import { useCallback, useEffect, useState } from 'react';

import { getOssDetails } from '@/backend/oss';
import { type ErrorData } from '@/components/info/InfoError';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { IOperationSchema, IOperationSchemaData } from '@/models/oss';
import { OssLoader } from '@/models/OssLoader';

function useOssDetails({ target }: { target?: string }) {
  const { loading: userLoading } = useAuth();
  const library = useLibrary();
  const [schema, setInner] = useState<IOperationSchema | undefined>(undefined);
  const [loading, setLoading] = useState(target != undefined);
  const [error, setError] = useState<ErrorData>(undefined);

  const setSchema = useCallback(
    (data?: IOperationSchemaData) => {
      if (!data) {
        setInner(undefined);
        return;
      }
      const newSchema = new OssLoader(data, library.items).produceOSS();
      setInner(newSchema);
    },
    [library.items]
  );

  function partialUpdate(data: Partial<IOperationSchema>) {
    setInner(prev => (prev ? { ...prev, ...data } : prev));
  }

  const reload = useCallback(
    (setCustomLoading?: typeof setLoading, callback?: () => void) => {
      setError(undefined);
      if (!target) {
        return;
      }
      getOssDetails(target, {
        showError: true,
        setLoading: setCustomLoading ?? setLoading,
        onError: error => {
          setInner(undefined);
          setError(error);
        },
        onSuccess: schema => {
          setSchema(schema);
          callback?.();
        }
      });
    },
    [target, setSchema]
  );

  useEffect(() => {
    if (!userLoading && !library.loading && library.items.length > 0) {
      reload();
    }
  }, [reload, userLoading, library.loading, library.items]);

  return { schema, setSchema, partialUpdate, reload, error, setError, loading };
}

export default useOssDetails;
