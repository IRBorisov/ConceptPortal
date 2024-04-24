'use client';

import { useCallback, useState } from 'react';

import { ErrorData } from '@/components/info/InfoError';
import { ILexemeData, ITextRequest, ITextResult, IWordFormPlain } from '@/models/language';
import { DataCallback, postGenerateLexeme, postInflectText, postParseText } from '@/app/backendAPI';

function useConceptText() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorData>(undefined);

  const inflect = useCallback((data: IWordFormPlain, onSuccess: DataCallback<ITextResult>) => {
    setError(undefined);
    postInflectText({
      data: data,
      showError: true,
      setLoading,
      onError: setError,
      onSuccess: data => {
        if (onSuccess) onSuccess(data);
      }
    });
  }, []);

  const parse = useCallback((data: ITextRequest, onSuccess: DataCallback<ITextResult>) => {
    setError(undefined);
    postParseText({
      data: data,
      showError: true,
      setLoading,
      onError: setError,
      onSuccess: data => {
        if (onSuccess) onSuccess(data);
      }
    });
  }, []);

  const generateLexeme = useCallback((data: ITextRequest, onSuccess: DataCallback<ILexemeData>) => {
    setError(undefined);
    postGenerateLexeme({
      data: data,
      showError: true,
      setLoading,
      onError: setError,
      onSuccess: data => {
        if (onSuccess) onSuccess(data);
      }
    });
  }, []);

  return { inflect, parse, generateLexeme, error, setError, loading };
}

export default useConceptText;
