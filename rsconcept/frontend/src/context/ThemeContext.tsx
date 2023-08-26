import { createContext, useContext, useLayoutEffect, useMemo, useState } from 'react';

import useLocalStorage from '../hooks/useLocalStorage';
import { darkT, IColorTheme, lightT } from '../utils/color';

interface IThemeContext {
  darkMode: boolean
  noNavigation: boolean
  viewportHeight: string
  mainHeight: string
  colors: IColorTheme
  toggleDarkMode: () => void
  toggleNoNavigation: () => void
}

const ThemeContext = createContext<IThemeContext | null>(null);
export const useConceptTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error(
      'useConceptTheme has to be used within <ThemeState.Provider>'
    );
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

  const setDarkClass = (isDark: boolean) => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.setAttribute('data-color-scheme', !isDark ? 'light' : 'dark');
  };

  useLayoutEffect(() => {
    setDarkClass(darkMode)
  }, [darkMode]);

  useLayoutEffect(() => {
    setColors(darkMode ? darkT : lightT)
  }, [darkMode, setColors]);

  const mainHeight = useMemo(
  () => {
    return !noNavigation ? 
      'calc(100vh - 8.6rem)'
    : '100vh'; 
  }, [noNavigation]);

  const viewportHeight = useMemo(
  () => {
    return !noNavigation ? 
      'calc(100vh - 3.9rem)'
    : '100vh'; 
  }, [noNavigation]);

  return (
    <ThemeContext.Provider value={{
      darkMode, colors,
      noNavigation,
      toggleDarkMode: () => setDarkMode(prev => !prev),
      toggleNoNavigation: () => setNoNavigation(prev => !prev),
      viewportHeight, mainHeight
    }}>
      {children}
    </ThemeContext.Provider>
  );
}
