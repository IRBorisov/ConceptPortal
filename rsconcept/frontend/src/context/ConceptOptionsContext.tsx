'use client';

import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';

import Tooltip from '@/components/ui/Tooltip';
import useLocalStorage from '@/hooks/useLocalStorage';
import { animationDuration } from '@/styling/animations';
import { darkT, IColorTheme, lightT } from '@/styling/color';
import { globals, storage } from '@/utils/constants';
import { contextOutsideScope } from '@/utils/labels';

interface IOptionsContext {
  viewportHeight: string;
  mainHeight: string;

  colors: IColorTheme;

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

  const [colors, setColors] = useState<IColorTheme>(lightT);

  const [noNavigationAnimation, setNoNavigationAnimation] = useState(false);
  const [noFooter, setNoFooter] = useState(false);
  const [showScroll, setShowScroll] = useState(false);

  function setDarkClass(isDark: boolean) {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.setAttribute('data-color-scheme', !isDark ? 'light' : 'dark');
  }

  useLayoutEffect(() => {
    setDarkClass(darkMode);
  }, [darkMode]);

  useLayoutEffect(() => {
    setColors(darkMode ? darkT : lightT);
  }, [darkMode, setColors]);

  const toggleNoNavigation = useCallback(() => {
    if (noNavigation) {
      setNoNavigationAnimation(false);
      setNoNavigation(false);
    } else {
      setNoNavigationAnimation(true);
      setTimeout(() => setNoNavigation(true), animationDuration.navigationToggle);
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
    setDarkMode(prev => !prev);
    window.location.reload();
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
    <OptionsContext.Provider
      value={{
        darkMode,
        adminMode,
        colors,
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
        calculateHeight
      }}
    >
      <>
        <Tooltip
          float // prettier: split-lines
          id={`${globals.tooltip}`}
          layer='z-topmost'
          place='right-start'
          className='mt-8 max-w-[20rem]'
        />
        <Tooltip
          float
          id={`${globals.value_tooltip}`}
          layer='z-topmost'
          className='max-w-[calc(min(40rem,100dvw-2rem))] text-justify'
        />

        {children}
      </>
    </OptionsContext.Provider>
  );
};
