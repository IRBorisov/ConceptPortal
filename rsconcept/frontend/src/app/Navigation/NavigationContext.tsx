'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

export interface NavigationProps {
  path: string;
  newTab?: boolean;
  force?: boolean;
}

interface INavigationContext {
  push: (props: NavigationProps) => void;
  pushAsync: (props: NavigationProps) => void | Promise<void>;
  replace: (props: Omit<NavigationProps, 'newTab'>) => void;
  replaceAsync: (props: Omit<NavigationProps, 'newTab'>) => void | Promise<void>;
  back: (force?: boolean) => void;
  forward: (force?: boolean) => void;

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

  function push(props: NavigationProps) {
    if (props.newTab) {
      window.open(`${props.path}`, '_blank');
    } else if (props.force || validate()) {
      setIsBlocked(false);
      Promise.resolve(router(props.path, { viewTransition: true })).catch(console.error);
    }
  }

  function pushAsync(props: NavigationProps): void | Promise<void> {
    if (props.newTab) {
      window.open(`${props.path}`, '_blank');
    } else if (props.force || validate()) {
      setIsBlocked(false);
      return router(props.path, { viewTransition: true });
    }
  }

  function replace(props: Omit<NavigationProps, 'newTab'>) {
    if (props.force || validate()) {
      setIsBlocked(false);
      Promise.resolve(router(props.path, { replace: true, viewTransition: true })).catch(console.error);
    }
  }

  function replaceAsync(props: Omit<NavigationProps, 'newTab'>): void | Promise<void> {
    if (props.force || validate()) {
      setIsBlocked(false);
      return router(props.path, { replace: true, viewTransition: true });
    }
  }

  function back(force?: boolean) {
    if (force || validate()) {
      Promise.resolve(router(-1)).catch(console.error);
      setIsBlocked(false);
    }
  }

  function forward(force?: boolean) {
    if (force || validate()) {
      Promise.resolve(router(1)).catch(console.error);
      setIsBlocked(false);
    }
  }

  return (
    <NavigationContext
      value={{
        push,
        pushAsync,
        replace,
        replaceAsync,
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
