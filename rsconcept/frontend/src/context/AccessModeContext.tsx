'use client';

import { createContext, useContext, useState } from 'react';

import { UserAccessMode } from '@/models/miscellaneous';

interface IAccessModeContext {
  mode: UserAccessMode
  setMode: React.Dispatch<React.SetStateAction<UserAccessMode>>
}

const AccessContext = createContext<IAccessModeContext | null>(null);
export const useAccessMode = () => {
  const context = useContext(AccessContext);
  if (!context) {
    throw new Error(
      'useAccessMode has to be used within <AccessModeState.Provider>'
    );
  }
  return context;
}

interface AccessModeStateProps {
  children: React.ReactNode
}

export const AccessModeState = ({ children }: AccessModeStateProps) => {
  const [mode, setMode] = useState<UserAccessMode>(UserAccessMode.READER);

  return (
  <AccessContext.Provider
    value={{ mode, setMode }}
  >
    {children}
  </AccessContext.Provider>);
};