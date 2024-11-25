'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { globals } from '@/utils/constants';
import { contextOutsideScope } from '@/utils/labels';

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
    throw new Error(contextOutsideScope('useConceptNavigation', 'NavigationState'));
  }
  return context;
};

export const NavigationState = ({ children }: React.PropsWithChildren) => {
  const router = useNavigate();
  const { pathname } = useLocation();

  const [isBlocked, setIsBlocked] = useState(false);
  const validate = useCallback(() => {
    return !isBlocked || confirm('Изменения не сохранены. Вы уверены что хотите совершить переход?');
  }, [isBlocked]);

  const canBack = useCallback(() => !!window.history && window.history?.length !== 0, []);

  const scrollTop = useCallback(() => {
    window.scrollTo(0, 0);
    const mainScroll = document.getElementById(globals.main_scroll);
    if (mainScroll) {
      mainScroll.scroll(0, 0);
    }
  }, []);

  const push = useCallback(
    (path: string, newTab?: boolean) => {
      if (newTab) {
        window.open(`${path}`, '_blank');
        return;
      }
      if (validate()) {
        scrollTop();
        Promise.resolve(router(path)).catch(console.log);
        setIsBlocked(false);
      }
    },
    [router, validate, scrollTop]
  );

  const replace = useCallback(
    (path: string) => {
      if (validate()) {
        scrollTop();
        Promise.resolve(router(path, { replace: true })).catch(console.log);
        setIsBlocked(false);
      }
    },
    [router, validate, scrollTop]
  );

  const back = useCallback(() => {
    if (validate()) {
      scrollTop();
      Promise.resolve(router(-1)).catch(console.log);
      setIsBlocked(false);
    }
  }, [router, validate, scrollTop]);

  const forward = useCallback(() => {
    if (validate()) {
      scrollTop();
      Promise.resolve(router(1)).catch(console.log);
      setIsBlocked(false);
    }
  }, [router, validate, scrollTop]);

  useEffect(() => {
    scrollTop();
  }, [pathname, scrollTop]);

  return (
    <NavigationContext.Provider
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
    </NavigationContext.Provider>
  );
};

export function useBlockNavigation(isBlocked: boolean) {
  const router = useConceptNavigation();
  useEffect(() => {
    router.setIsBlocked(isBlocked);
    return () => router.setIsBlocked(false);
  }, [router, isBlocked]);
}
