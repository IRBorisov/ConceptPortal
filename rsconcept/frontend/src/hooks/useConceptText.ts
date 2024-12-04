'use client';

import { useCallback, useState } from 'react';

import { DataCallback } from '@/backend/apiTransport';
import { postGenerateLexeme, postInflectText, postParseText } from '@/backend/cctext';
import { ErrorData } from '@/components/info/InfoError';
import { ILexemeData, ITextRequest, ITextResult, IWordFormPlain } from '@/models/language';

function useConceptText() {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<ErrorData>(undefined);

  const inflect = useCallback((data: IWordFormPlain, onSuccess: DataCallback<ITextResult>) => {
    setError(undefined);
    postInflectText({
      data: data,
      showError: true,
      setLoading: setProcessing,
      onError: setError,
      onSuccess: data => {
        onSuccess?.(data);
      }
    });
  }, []);

  const parse = useCallback((data: ITextRequest, onSuccess: DataCallback<ITextResult>) => {
    setError(undefined);
    postParseText({
      data: data,
      showError: true,
      setLoading: setProcessing,
      onError: setError,
      onSuccess: data => {
        onSuccess?.(data);
      }
    });
  }, []);

  const generateLexeme = useCallback((data: ITextRequest, onSuccess: DataCallback<ILexemeData>) => {
    setError(undefined);
    postGenerateLexeme({
      data: data,
      showError: true,
      setLoading: setProcessing,
      onError: setError,
      onSuccess: data => {
        onSuccess?.(data);
      }
    });
  }, []);

  return { inflect, parse, generateLexeme, error, setError, processing };
}

export default useConceptText;
