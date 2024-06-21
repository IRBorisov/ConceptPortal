'use client';

import { useCallback, useEffect, useState } from 'react';

import { getOssDetails } from '@/app/backendAPI';
import { type ErrorData } from '@/components/info/InfoError';
import { AccessPolicy, LibraryItemType } from '@/models/library.ts';
import { IOperationSchema, IOperationSchemaData } from '@/models/oss';
import { OssLoader } from '@/models/OssLoader';

function useOssDetails({ target }: { target?: string }) {
  const [schema, setInner] = useState<IOperationSchema | undefined>(undefined);
  const [loading, setLoading] = useState(false);
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

      const staticData = {
        id: Number(target),
        comment: '123',
        alias: 'oss1',
        access_policy: AccessPolicy.PUBLIC,
        editors: [],
        owner: 1,
        item_type: LibraryItemType.OSS,
        location: '/U',
        read_only: false,
        subscribers: [],
        time_create: '0',
        time_update: '0',
        title: 'TestOss',
        visible: false
      };

      getOssDetails(target, {
        showError: true,
        setLoading: setCustomLoading ?? setLoading,
        onError: error => {
          setInner(undefined);
          setError(error);
        },
        onSuccess: schema => {
          const combinedData = {
            ...staticData,
            ...schema
          };
          setSchema(combinedData);
          if (callback) callback();
        }
      });
    },
    [target]
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return { schema, setSchema, reload, error, setError, loading };
}

export default useOssDetails;
