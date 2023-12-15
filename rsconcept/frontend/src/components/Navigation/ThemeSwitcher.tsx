import { DarkThemeIcon, LightThemeIcon } from '@/components/Icons';
import { useConceptTheme } from '@/context/ThemeContext';

import NavigationButton from './NavigationButton';

function ThemeSwitcher() {
  const { darkMode, toggleDarkMode } = useConceptTheme();
  if (darkMode) {
    return (
    <NavigationButton
      description='Светлая тема'
      icon={<LightThemeIcon />}
      onClick={toggleDarkMode}
    />);
  } else {
    return (
    <NavigationButton
      description='Темная тема'
      icon={<DarkThemeIcon />}
      onClick={toggleDarkMode}
    />);
  }
}

export default ThemeSwitcher;