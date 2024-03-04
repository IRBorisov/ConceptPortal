'use client';

import { useCallback, useEffect, useState } from 'react';

import { type ErrorData } from '@/components/InfoError';
import { IRSForm, IRSFormData } from '@/models/rsform';
import { loadRSFormData } from '@/models/rsformAPI';
import { getRSFormDetails } from '@/utils/backendAPI';

function useRSFormDetails({ target, version }: { target?: string; version?: string }) {
  const [schema, setInnerSchema] = useState<IRSForm | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorData>(undefined);

  function setSchema(data?: IRSFormData) {
    if (!data) {
      setInnerSchema(undefined);
      return;
    }
    const schema = loadRSFormData(data);
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
    reload();
  }, [reload]);

  return { schema, setSchema, reload, error, setError, loading };
}

export default useRSFormDetails;
