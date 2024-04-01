'use client';

import clsx from 'clsx';
import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';

import Tooltip from '@/components/ui/Tooltip';
import useLocalStorage from '@/hooks/useLocalStorage';
import { FontStyle } from '@/models/miscellaneous';
import { animationDuration } from '@/styling/animations';
import { darkT, IColorTheme, lightT } from '@/styling/color';
import { globals, storage } from '@/utils/constants';

interface IOptionsContext {
  viewportHeight: string;
  mainHeight: string;

  colors: IColorTheme;

  darkMode: boolean;
  toggleDarkMode: () => void;

  mathFont: FontStyle;
  setMathFont: (value: FontStyle) => void;

  noNavigationAnimation: boolean;
  noNavigation: boolean;
  toggleNoNavigation: () => void;

  noFooter: boolean;
  setNoFooter: React.Dispatch<React.SetStateAction<boolean>>;

  showScroll: boolean;
  setShowScroll: React.Dispatch<React.SetStateAction<boolean>>;

  showHelp: boolean;
  toggleShowHelp: () => void;

  calculateHeight: (offset: string) => string;
}

const OptionsContext = createContext<IOptionsContext | null>(null);
export const useConceptOptions = () => {
  const context = useContext(OptionsContext);
  if (!context) {
    throw new Error('useConceptTheme has to be used within <ThemeState.Provider>');
  }
  return context;
};

interface OptionsStateProps {
  children: React.ReactNode;
}

export const OptionsState = ({ children }: OptionsStateProps) => {
  const [darkMode, setDarkMode] = useLocalStorage(storage.themeDark, false);
  const [mathFont, setMathFont] = useLocalStorage<FontStyle>(storage.rseditFont, 'math');
  const [showHelp, setShowHelp] = useLocalStorage(storage.optionsHelp, true);
  const [noNavigation, setNoNavigation] = useState(false);

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
    (offset: string) => {
      if (noNavigation) {
        return `calc(100vh - (${offset}))`;
      } else if (noFooter) {
        return `calc(100vh - 3rem - (${offset}))`;
      } else {
        return `calc(100vh - 6.75rem - (${offset}))`;
      }
    },
    [noNavigation, noFooter]
  );

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
    window.location.reload();
  }, [setDarkMode]);

  const mainHeight = useMemo(() => {
    return !noNavigation ? 'calc(100vh - 6.75rem)' : '100vh';
  }, [noNavigation]);

  const viewportHeight = useMemo(() => {
    return !noNavigation ? 'calc(100vh - 3rem)' : '100vh';
  }, [noNavigation]);

  return (
    <OptionsContext.Provider
      value={{
        darkMode,
        colors,
        mathFont,
        setMathFont,
        noNavigationAnimation,
        noNavigation,
        noFooter,
        showScroll,
        showHelp,
        toggleDarkMode: toggleDarkMode,
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
          float
          id={`${globals.tooltip}`}
          layer='z-topmost'
          place='right-start'
          className={clsx('mt-3 translate-y-1/2', 'max-w-[20rem]')}
        />
        {children}
      </>
    </OptionsContext.Provider>
  );
};
