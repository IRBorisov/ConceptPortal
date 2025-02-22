'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

interface INavigationContext {
  push: (path: string, newTab?: boolean) => void;
  replace: (path: string) => void;
  back: () => void;
  forward: () => void;

  canBack: () => boolean;

  isBlocked: boolean;
  setIsBlocked: (value: boolean) => void;
}

const NavigationContext = createContext<INavigationContext | null>(null);
export const useConceptNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useConceptNavigation has to be used within <NavigationState>');
  }
  return context;
};

export const NavigationState = ({ children }: React.PropsWithChildren) => {
  const router = useNavigate();

  const [isBlocked, setIsBlocked] = useState(false);

  function validate() {
    return !isBlocked || confirm('Изменения не сохранены. Вы уверены что хотите совершить переход?');
  }

  function canBack() {
    return !!window.history && window.history?.length !== 0;
  }

  function push(path: string, newTab?: boolean) {
    if (newTab) {
      window.open(`${path}`, '_blank');
      return;
    }
    if (validate()) {
      Promise.resolve(router(path, { viewTransition: true })).catch(console.error);
      setIsBlocked(false);
    }
  }

  function replace(path: string) {
    if (validate()) {
      Promise.resolve(router(path, { replace: true, viewTransition: true })).catch(console.error);
      setIsBlocked(false);
    }
  }

  function back() {
    if (validate()) {
      Promise.resolve(router(-1)).catch(console.error);
      setIsBlocked(false);
    }
  }

  function forward() {
    if (validate()) {
      Promise.resolve(router(1)).catch(console.error);
      setIsBlocked(false);
    }
  }

  return (
    <NavigationContext
      value={{
        push,
        replace,
        back,
        forward,
        canBack,
        isBlocked,
        setIsBlocked
      }}
    >
      {children}
    </NavigationContext>
  );
};

export function useBlockNavigation(isBlocked: boolean) {
  const router = useConceptNavigation();
  useEffect(() => {
    router.setIsBlocked(isBlocked);
    return () => router.setIsBlocked(false);
  }, [router, isBlocked]);
}
