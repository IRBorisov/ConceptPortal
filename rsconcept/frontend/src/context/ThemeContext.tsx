import { createContext, useContext, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';


interface IThemeContext {
  darkMode: boolean
  toggleDarkMode: () => void
}

export const ThemeContext = createContext<IThemeContext>({
  darkMode: true,
  toggleDarkMode: () => {}
})

interface ThemeStateProps {
  children: React.ReactNode
}

export const ThemeState = ({ children }: ThemeStateProps) => {
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);

  const setDarkClass = (isDark: boolean) => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  };

  useEffect(() => {
    setDarkClass(darkMode)
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{
      darkMode, toggleDarkMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);