'use client';

import { createContext, type ReactNode, useContext } from 'react';

import { type RSForm } from '@/features/rsform/models/rsform';

const ShowAstSchemaContext = createContext<RSForm | null>(null);

export function ShowAstSchemaProvider({
  schema,
  children
}: {
  schema: RSForm;
  children: ReactNode;
}) {
  return (
    <ShowAstSchemaContext.Provider value={schema}>
      {children}
    </ShowAstSchemaContext.Provider>
  );
}

export function useShowAstSchema(): RSForm | null {
  return useContext(ShowAstSchemaContext);
}
