'use client';

import { createContext, useCallback, useContext, useState } from 'react';

import { ErrorData } from '@/components/info/InfoError';
import useOssDetails from '@/hooks/useOssDetails';
import { LibraryItemID } from '@/models/library';
import { IOperationSchema, IOperationSchemaData } from '@/models/oss';
import { contextOutsideScope } from '@/utils/labels';

interface IGlobalOssContext {
  schema: IOperationSchema | undefined;
  setID: (id: string | undefined) => void;
  setData: (data: IOperationSchemaData) => void;
  loading: boolean;
  loadingError: ErrorData;
  isValid: boolean;

  invalidate: () => void;
  invalidateItem: (target: LibraryItemID) => void;
  partialUpdate: (data: Partial<IOperationSchema>) => void;
  reload: (callback?: () => void) => void;
}

const GlobalOssContext = createContext<IGlobalOssContext | null>(null);
export const useGlobalOss = (): IGlobalOssContext => {
  const context = useContext(GlobalOssContext);
  if (context === null) {
    throw new Error(contextOutsideScope('useGlobalOss', 'GlobalOssState'));
  }
  return context;
};

export const GlobalOssState = ({ children }: React.PropsWithChildren) => {
  const [isValid, setIsValid] = useState(true);
  const [ossID, setIdInternal] = useState<string | undefined>(undefined);
  const {
    schema: schema, // prettier: split lines
    error: loadingError,
    setSchema: setDataInternal,
    loading: loading,
    reload: reloadInternal,
    partialUpdate
  } = useOssDetails({ target: ossID });

  const reload = useCallback(
    (callback?: () => void) => {
      reloadInternal(undefined, () => {
        setIsValid(true);
        callback?.();
      });
    },
    [reloadInternal]
  );

  const setData = useCallback(
    (data: IOperationSchemaData) => {
      setDataInternal(data);
      setIsValid(true);
    },
    [setDataInternal]
  );

  const setID = useCallback(
    (id: string | undefined) => {
      setIdInternal(prev => {
        if (prev === id && !isValid) {
          reload();
        }
        return id;
      });
    },
    [setIdInternal, isValid, reload]
  );

  const invalidate = useCallback(() => {
    setIsValid(false);
  }, []);

  const invalidateItem = useCallback(
    (target: LibraryItemID) => {
      if (schema?.schemas.includes(target)) {
        setIsValid(false);
      }
    },
    [schema]
  );

  return (
    <GlobalOssContext
      value={{
        schema,
        setID,
        setData,
        loading,
        loadingError,
        reload,
        partialUpdate,
        isValid,
        invalidateItem,
        invalidate
      }}
    >
      {children}
    </GlobalOssContext>
  );
};
