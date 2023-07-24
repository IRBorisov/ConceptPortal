import { useConceptTheme } from '../../context/ThemeContext';
import { DarkThemeIcon, LightThemeIcon } from '../Icons';
import NavigationButton from './NavigationButton';

function ThemeSwitcher() {
  const {darkMode, toggleDarkMode} = useConceptTheme();
  return (
    <>
      {darkMode && <NavigationButton icon={<LightThemeIcon />} description='Светлая тема' onClick={toggleDarkMode} />}
      {!darkMode && <NavigationButton icon={<DarkThemeIcon />} description='Темная тема' onClick={toggleDarkMode} />}
    </>
  );
}

export default ThemeSwitcher;