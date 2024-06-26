'use client';

import { useCallback, useEffect, useState } from 'react';

import { getOssDetails } from '@/app/backendAPI';
import { type ErrorData } from '@/components/info/InfoError';
import { useAuth } from '@/context/AuthContext';
import { IOperationSchema, IOperationSchemaData } from '@/models/oss';
import { OssLoader } from '@/models/OssLoader';

function useOssDetails({ target }: { target?: string }) {
  const { loading: userLoading } = useAuth();
  const [schema, setInner] = useState<IOperationSchema | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorData>(undefined);

  function setSchema(data?: IOperationSchemaData) {
    if (!data) {
      setInner(undefined);
      return;
    }
    const newSchema = new OssLoader(data).produceOSS();
    setInner(newSchema);
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
          if (callback) callback();
        }
      });
    },
    [target]
  );

  useEffect(() => {
    if (!userLoading) {
      reload();
    }
  }, [reload, userLoading]);

  return { schema, setSchema, reload, error, setError, loading };
}

export default useOssDetails;
