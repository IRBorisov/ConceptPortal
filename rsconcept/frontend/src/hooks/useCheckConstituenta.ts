'use client';

import { useCallback, useState } from 'react';

import { DataCallback } from '@/backend/apiTransport';
import { postCheckConstituenta } from '@/backend/rsforms';
import { type ErrorData } from '@/components/info/InfoError';
import { ICheckConstituentaData, IConstituenta, type IRSForm } from '@/models/rsform';
import { IExpressionParse } from '@/models/rslang';

function useCheckConstituenta({ schema }: { schema?: IRSForm }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<ErrorData>(undefined);
  const [parseData, setParseData] = useState<IExpressionParse | undefined>(undefined);

  const resetParse = useCallback(() => setParseData(undefined), []);

  function checkConstituenta(expression: string, activeCst: IConstituenta, onSuccess?: DataCallback<IExpressionParse>) {
    const data: ICheckConstituentaData = {
      definition_formal: expression,
      alias: activeCst.alias,
      cst_type: activeCst.cst_type
    };
    setError(undefined);
    postCheckConstituenta(String(schema!.id), {
      data: data,
      showError: true,
      setLoading: setProcessing,
      onError: setError,
      onSuccess: parse => {
        setParseData(parse);
        onSuccess?.(parse);
      }
    });
  }

  return { parseData, checkConstituenta, resetParse, error, setError, processing };
}

export default useCheckConstituenta;
