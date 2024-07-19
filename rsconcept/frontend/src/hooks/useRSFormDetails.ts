'use client';

import { useCallback, useEffect, useState } from 'react';

import { getRSFormDetails } from '@/app/backendAPI';
import { type ErrorData } from '@/components/info/InfoError';
import { useAuth } from '@/context/AuthContext';
import { IRSForm, IRSFormData } from '@/models/rsform';
import { RSFormLoader } from '@/models/RSFormLoader';

function useRSFormDetails({ target, version }: { target?: string; version?: string }) {
  const { loading: userLoading } = useAuth();
  const [schema, setInnerSchema] = useState<IRSForm | undefined>(undefined);
  const [loading, setLoading] = useState(target != undefined);
  const [error, setError] = useState<ErrorData>(undefined);

  function setSchema(data?: IRSFormData) {
    if (!data) {
      setInnerSchema(undefined);
      return;
    }
    const schema = new RSFormLoader(data).produceRSForm();
    setInnerSchema(schema);
  }

  const reload = useCallback(
    (setCustomLoading?: typeof setLoading, callback?: () => void) => {
      setError(undefined);
      if (!target) {
        return;
      }
      getRSFormDetails(target, version ?? '', {
        showError: true,
        setLoading: setCustomLoading ?? setLoading,
        onError: error => {
          setInnerSchema(undefined);
          setError(error);
        },
        onSuccess: schema => {
          setSchema(schema);
          if (callback) callback();
        }
      });
    },
    [target, version]
  );

  useEffect(() => {
    if (!userLoading) {
      reload();
    }
  }, [reload, userLoading]);

  return { schema, setSchema, reload, error, setError, loading };
}

export default useRSFormDetails;
