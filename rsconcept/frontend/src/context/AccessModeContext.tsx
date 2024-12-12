'use client';

import { createContext, useContext, useState } from 'react';

import { UserLevel } from '@/models/user';
import { contextOutsideScope } from '@/utils/labels';

interface IAccessModeContext {
  accessLevel: UserLevel;
  setAccessLevel: React.Dispatch<React.SetStateAction<UserLevel>>;
}

const AccessContext = createContext<IAccessModeContext | null>(null);
export const useAccessMode = () => {
  const context = useContext(AccessContext);
  if (!context) {
    throw new Error(contextOutsideScope('useAccessMode', 'AccessModeState'));
  }
  return context;
};

export const AccessModeState = ({ children }: React.PropsWithChildren) => {
  const [accessLevel, setAccessLevel] = useState<UserLevel>(UserLevel.READER);
  return <AccessContext value={{ accessLevel, setAccessLevel }}>{children}</AccessContext>;
};
