import { createContext, useContext, useEffect, useState } from 'react';

import useLocalStorage from '../hooks/useLocalStorage';

interface IThemeContext {
  darkMode: boolean
  noNavigation: boolean
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

  useEffect(() => {
    setDarkClass(darkMode)
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{
      darkMode,
      toggleDarkMode: () => setDarkMode(prev => !prev),
      noNavigation,
      toggleNoNavigation: () => setNoNavigation(prev => !prev)
    }}>
      {children}
    </ThemeContext.Provider>
  );
}
