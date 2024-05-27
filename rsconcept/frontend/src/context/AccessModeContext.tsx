'use client';

import { createContext, useContext, useState } from 'react';

import { UserLevel } from '@/models/user';

interface IAccessModeContext {
  accessLevel: UserLevel;
  setAccessLevel: React.Dispatch<React.SetStateAction<UserLevel>>;
}

const AccessContext = createContext<IAccessModeContext | null>(null);
export const useAccessMode = () => {
  const context = useContext(AccessContext);
  if (!context) {
    throw new Error('useAccessMode has to be used within <AccessModeState.Provider>');
  }
  return context;
};

interface AccessModeStateProps {
  children: React.ReactNode;
}

export const AccessModeState = ({ children }: AccessModeStateProps) => {
  const [accessLevel, setAccessLevel] = useState<UserLevel>(UserLevel.READER);

  return <AccessContext.Provider value={{ accessLevel, setAccessLevel }}>{children}</AccessContext.Provider>;
};
