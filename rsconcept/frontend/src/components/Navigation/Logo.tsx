import { useConceptTheme } from '@/context/ThemeContext';

function Logo() {
  const { darkMode } = useConceptTheme();
  return (
  <img alt='Логотип КонцептПортал'
    className='max-h-[1.6rem]'
    src={!darkMode ? '/logo_full.svg' : '/logo_full_dark.svg'}
  />);
}
export default Logo;