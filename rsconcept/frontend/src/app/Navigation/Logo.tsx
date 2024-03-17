import clsx from 'clsx';

import { useConceptTheme } from '@/context/ThemeContext';
import useWindowSize from '@/hooks/useWindowSize';

function Logo() {
  const { darkMode } = useConceptTheme();
  const size = useWindowSize();

  return (
    <img
      alt='Логотип КонцептПортал'
      className={clsx('max-h-[1.6rem] min-w-fit', {
        'min-w-[11.5rem]': size.isSmall
      })}
      src={size.isSmall ? '/logo_sign.svg' : !darkMode ? '/logo_full.svg' : '/logo_full_dark.svg'}
    />
  );
}
export default Logo;
