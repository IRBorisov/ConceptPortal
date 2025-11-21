'use client';

import { createContext, use, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { useTooltipsStore } from '@/stores/tooltips';

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

  setRequireConfirmation: (value: boolean) => void;
}

const NavigationContext = createContext<INavigationContext | null>(null);
export const useConceptNavigation = () => {
  const context = use(NavigationContext);
  if (!context) {
    throw new Error('useConceptNavigation has to be used within <NavigationState>');
  }
  return context;
};

export const NavigationState = ({ children }: React.PropsWithChildren) => {
  const router = useNavigate();

  const isBlocked = useRef(false);
  const [internalNavigation, setInternalNavigation] = useState(false);
  const enableTooltips = useTooltipsStore(state => state.showTooltips);

  function validate() {
    return !isBlocked.current || confirm('Изменения не сохранены. Вы уверены что хотите совершить переход?');
  }

  function canBack() {
    return internalNavigation && !!window.history && window.history?.length !== 0;
  }

  function push(props: NavigationProps) {
    if (props.newTab) {
      window.open(`${props.path}`, '_blank');
    } else if (props.force || validate()) {
      isBlocked.current = false;
      setInternalNavigation(true);
      Promise.resolve(router(props.path, { viewTransition: true }))
        .then(enableTooltips)
        .catch(console.error);
    }
  }

  function pushAsync(props: NavigationProps): void | Promise<void> {
    if (props.newTab) {
      window.open(`${props.path}`, '_blank');
    } else if (props.force || validate()) {
      isBlocked.current = false;
      setInternalNavigation(true);
      enableTooltips();
      return router(props.path, { viewTransition: true });
    }
  }

  function replace(props: Omit<NavigationProps, 'newTab'>) {
    if (props.force || validate()) {
      isBlocked.current = false;
      Promise.resolve(router(props.path, { replace: true, viewTransition: true }))
        .then(enableTooltips)
        .catch(console.error);
    }
  }

  function replaceAsync(props: Omit<NavigationProps, 'newTab'>): void | Promise<void> {
    if (props.force || validate()) {
      isBlocked.current = false;
      enableTooltips();
      return router(props.path, { replace: true, viewTransition: true });
    }
  }

  function back(force?: boolean) {
    if (force || validate()) {
      Promise.resolve(router(-1)).then(enableTooltips).catch(console.error);
      isBlocked.current = false;
    }
  }

  function forward(force?: boolean) {
    if (force || validate()) {
      Promise.resolve(router(1)).then(enableTooltips).catch(console.error);
      isBlocked.current = false;
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
        setRequireConfirmation: (value: boolean) => (isBlocked.current = value)
      }}
    >
      {children}
    </NavigationContext>
  );
};

export function useBlockNavigation(isBlocked: boolean) {
  const { setRequireConfirmation } = useConceptNavigation();
  useEffect(() => {
    setRequireConfirmation(isBlocked);
    return () => setRequireConfirmation(false);
  }, [setRequireConfirmation, isBlocked]);
}
