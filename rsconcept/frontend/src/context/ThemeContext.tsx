import { createContext, useContext, useLayoutEffect, useMemo, useState } from 'react';

import useLocalStorage from '../hooks/useLocalStorage';
import { darkT, IColorTheme, lightT } from '../utils/color';

interface IThemeContext {
  viewportHeight: string
  mainHeight: string
  
  colors: IColorTheme
  
  darkMode: boolean
  toggleDarkMode: () => void

  noNavigation: boolean
  toggleNoNavigation: () => void

  noFooter: boolean
  setNoFooter: (value: boolean) => void

  showScroll: boolean
  setShowScroll: (value: boolean) => void
}

const ThemeContext = createContext<IThemeContext | null>(null);
export const useConceptTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useConceptTheme has to be used within <ThemeState.Provider>');
  }
  return context;
}

interface ThemeStateProps {
  children: React.ReactNode
}

export const ThemeState = ({ children }: ThemeStateProps) => {
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [colors, setColors] = useState<IColorTheme>(lightT);
  const [noNavigation, setNoNavigation] = useState(false);
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
    setDarkClass(darkMode)
  }, [darkMode]);

  useLayoutEffect(() => {
    setColors(darkMode ? darkT : lightT)
  }, [darkMode, setColors]);

  const mainHeight = useMemo(
  () => {
    return !noNavigation ?
      'calc(100vh - 7rem - 2px)'
    : '100vh';
  }, [noNavigation]);

  const viewportHeight = useMemo(
  () => {
    return !noNavigation ?
      'calc(100vh - 3rem - 2px)'
    : '100vh';
  }, [noNavigation]);

  return (
    <ThemeContext.Provider value={{
      darkMode, colors,
      noNavigation, noFooter, showScroll,
      toggleDarkMode: () => setDarkMode(prev => !prev),
      toggleNoNavigation: () => setNoNavigation(prev => !prev),
      setNoFooter, setShowScroll,
      viewportHeight, mainHeight
    }}>
      {children}
    </ThemeContext.Provider>
  );
}
