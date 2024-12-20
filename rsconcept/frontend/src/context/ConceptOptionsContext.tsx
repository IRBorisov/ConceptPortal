'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';

import InfoConstituenta from '@/components/info/InfoConstituenta';
import Loader from '@/components/ui/Loader';
import Tooltip from '@/components/ui/Tooltip';
import useLocalStorage from '@/hooks/useLocalStorage';
import { IConstituenta } from '@/models/rsform';
import { globals, PARAMETER, storage } from '@/utils/constants';
import { contextOutsideScope } from '@/utils/labels';

interface IOptionsContext {
  viewportHeight: string;
  mainHeight: string;

  darkMode: boolean;
  toggleDarkMode: () => void;

  adminMode: boolean;
  toggleAdminMode: () => void;

  noNavigationAnimation: boolean;
  noNavigation: boolean;
  toggleNoNavigation: () => void;

  noFooter: boolean;
  setNoFooter: React.Dispatch<React.SetStateAction<boolean>>;

  showScroll: boolean;
  setShowScroll: React.Dispatch<React.SetStateAction<boolean>>;

  showHelp: boolean;
  toggleShowHelp: () => void;

  folderMode: boolean;
  setFolderMode: React.Dispatch<React.SetStateAction<boolean>>;

  location: string;
  setLocation: React.Dispatch<React.SetStateAction<string>>;

  setHoverCst: (newValue: IConstituenta | undefined) => void;

  calculateHeight: (offset: string, minimum?: string) => string;
}

const OptionsContext = createContext<IOptionsContext | null>(null);
export const useConceptOptions = () => {
  const context = useContext(OptionsContext);
  if (!context) {
    throw new Error(contextOutsideScope('useConceptTheme', 'ThemeState'));
  }
  return context;
};

export const OptionsState = ({ children }: React.PropsWithChildren) => {
  const [darkMode, setDarkMode] = useLocalStorage(storage.themeDark, false);
  const [adminMode, setAdminMode] = useLocalStorage(storage.optionsAdmin, false);
  const [showHelp, setShowHelp] = useLocalStorage(storage.optionsHelp, true);
  const [noNavigation, setNoNavigation] = useState(false);

  const [folderMode, setFolderMode] = useLocalStorage<boolean>(storage.librarySearchFolderMode, true);
  const [location, setLocation] = useLocalStorage<string>(storage.librarySearchLocation, '');

  const [noNavigationAnimation, setNoNavigationAnimation] = useState(false);
  const [noFooter, setNoFooter] = useState(false);
  const [showScroll, setShowScroll] = useState(false);

  const [hoverCst, setHoverCst] = useState<IConstituenta | undefined>(undefined);

  function setDarkClass(isDark: boolean) {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.setAttribute('data-color-scheme', !isDark ? 'light' : 'dark');
  }

  useEffect(() => {
    setDarkClass(darkMode);
  }, [darkMode]);

  const toggleNoNavigation = useCallback(() => {
    if (noNavigation) {
      setNoNavigationAnimation(false);
      setNoNavigation(false);
    } else {
      setNoNavigationAnimation(true);
      setTimeout(() => setNoNavigation(true), PARAMETER.moveDuration);
    }
  }, [noNavigation]);

  const calculateHeight = useCallback(
    (offset: string, minimum: string = '0px') => {
      if (noNavigation) {
        return `max(calc(100dvh - (${offset})), ${minimum})`;
      } else if (noFooter) {
        return `max(calc(100dvh - 3rem - (${offset})), ${minimum})`;
      } else {
        return `max(calc(100dvh - 6.75rem - (${offset})), ${minimum})`;
      }
    },
    [noNavigation, noFooter]
  );

  const toggleDarkMode = useCallback(() => {
    if (!document.startViewTransition) {
      setDarkMode(prev => !prev);
    } else {
      const style = document.createElement('style');
      style.innerHTML = `
        * {
          animation: none !important;
          transition: none !important;
        }
      `;
      document.head.appendChild(style);

      document.startViewTransition(() => {
        flushSync(() => {
          setDarkMode(prev => !prev);
        });
      });

      setTimeout(() => document.head.removeChild(style), PARAMETER.moveDuration);
    }
  }, [setDarkMode]);

  const mainHeight = useMemo(() => {
    if (noNavigation) {
      return '100dvh';
    } else if (noFooter) {
      return 'calc(100dvh - 3rem)';
    } else {
      return 'calc(100dvh - 6.75rem)';
    }
  }, [noNavigation, noFooter]);

  const viewportHeight = useMemo(() => {
    return !noNavigation ? 'calc(100dvh - 3rem)' : '100dvh';
  }, [noNavigation]);

  return (
    <OptionsContext
      value={{
        darkMode,
        adminMode,
        noNavigationAnimation,
        noNavigation,
        noFooter,
        folderMode,
        setFolderMode,
        location,
        setLocation,
        showScroll,
        showHelp,
        toggleDarkMode: toggleDarkMode,
        toggleAdminMode: () => setAdminMode(prev => !prev),
        toggleNoNavigation: toggleNoNavigation,
        setNoFooter,
        setShowScroll,
        toggleShowHelp: () => setShowHelp(prev => !prev),
        viewportHeight,
        mainHeight,
        calculateHeight,
        setHoverCst
      }}
    >
      <>
        <Tooltip
          float
          id={globals.tooltip}
          layer='z-topmost'
          place='right-start'
          className='mt-8 max-w-[20rem] break-words'
        />
        <Tooltip
          float
          id={globals.value_tooltip}
          layer='z-topmost'
          className='max-w-[calc(min(40rem,100dvw-2rem))] text-justify'
        />
        <Tooltip clickable id={globals.constituenta_tooltip} layer='z-modalTooltip' className='max-w-[30rem]'>
          {hoverCst ? <InfoConstituenta data={hoverCst} onClick={event => event.stopPropagation()} /> : <Loader />}
        </Tooltip>

        {children}
      </>
    </OptionsContext>
  );
};
