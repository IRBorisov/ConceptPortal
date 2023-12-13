'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { unstable_usePrompt, useLocation, useNavigate } from 'react-router-dom';

import { globalIDs } from '@/utils/constants';

interface INagivationContext{
  push: (path: string) => void
  replace: (path: string) => void
  back: () => void
  forward: () => void

  canBack: () => boolean
  
  isBlocked: boolean
  setIsBlocked: (value: boolean) => void
}

const NagivationContext = createContext<INagivationContext | null>(null);
export const useConceptNavigation = () => {
  const context = useContext(NagivationContext);
  if (!context) {
    throw new Error('useConceptNavigation has to be used within <NavigationState.Provider>');
  }
  return context;
}

interface NavigationStateProps {
  children: React.ReactNode
}

export const NavigationState = ({ children }: NavigationStateProps) => {
  const router = useNavigate();
  const { pathname } = useLocation();

  const [isBlocked, setIsBlocked] = useState(false);
  unstable_usePrompt({
    when: isBlocked,
    message: 'Изменения не сохранены. Вы уверены что хотите совершить переход?'
  });

  const canBack = useCallback(
  () => {
    return (!!window.history && window.history?.length !== 0);
  }, []);

  const scrollTop = useCallback(
  () => {
    window.scrollTo(0, 0);
    const mainScroll = document.getElementById(globalIDs.main_scroll);
    if (mainScroll) {
      mainScroll.scroll(0,0);
    }
  }, []);

  const push = useCallback(
  (path: string) => {
    scrollTop();
    setIsBlocked(false);
    router(path);
  }, [router, scrollTop]);

  const replace = useCallback(
  (path: string) => {
    scrollTop();
    setIsBlocked(false);
    router(path, {replace: true});
  }, [router, scrollTop]);

  const back = useCallback(
  () => {
    scrollTop();
    setIsBlocked(false);
    router(-1);
  }, [router, scrollTop]);

  const forward = useCallback(
  () => {
    scrollTop();
    setIsBlocked(false);
    router(1);
  }, [router, scrollTop]);

  useEffect(() => {
    scrollTop();
  }, [pathname, scrollTop]);

  return (
  <NagivationContext.Provider value={{
    push, replace, back, forward, 
    canBack, isBlocked, setIsBlocked
  }}>
    {children}
  </NagivationContext.Provider>);
}
