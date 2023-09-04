import { createContext, useCallback, useContext, useEffect } from 'react';
import { NavigateOptions, useLocation, useNavigate } from 'react-router-dom';

import { globalIDs } from '../utils/constants';

interface INagivationContext{
  navigateTo: (path: string, options?: NavigateOptions) => void
  navigateHistory: (offset: number) => void
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
  const implNavigate = useNavigate();
  const { pathname } = useLocation();

  function scrollTop() {
    window.scrollTo(0, 0);
    const mainScroll = document.getElementById(globalIDs.main_scroll);
    if (mainScroll) {
      mainScroll.scroll(0,0);
    }
  }

  const navigateTo = useCallback(
  (path: string, options?: NavigateOptions) => {
    scrollTop();
    implNavigate(path, options);
  }, [implNavigate]);

  const navigateHistory = useCallback(
  (offset: number) => {
    scrollTop();
    implNavigate(offset);
  }, [implNavigate]);

  useEffect(() => {
    scrollTop();
  }, [pathname]);


  return (
    <NagivationContext.Provider value={{
      navigateTo, navigateHistory
    }}>
      {children}
    </NagivationContext.Provider>
  );
}
