import { Link } from 'react-router-dom';

import { useConceptTheme } from '../../context/ThemeContext';
import useWindowSize from '../../hooks/useWindowSize';

const HIDE_LOGO_TEXT_LIMIT = 700;

function Logo() {
  const { darkMode } = useConceptTheme();
  const windowSize = useWindowSize();

  return (
  <Link to='/' tabIndex={-1}
    className='flex items-center h-full mr-2'
  >
    {(windowSize.width && windowSize.width >= HIDE_LOGO_TEXT_LIMIT && !darkMode) ?
    <img alt=''
      src='/logo_full.svg'
      className='max-h-[1.6rem] min-w-[1.6rem]'
    /> : null}
    {(windowSize.width && windowSize.width >= HIDE_LOGO_TEXT_LIMIT && darkMode) ?
    <img alt=''
      src='/logo_full_dark.svg'
      className='max-h-[1.6rem] min-w-[1.6rem]'
    /> : null}
    {(!windowSize.width || windowSize.width < HIDE_LOGO_TEXT_LIMIT) ? 
    <img alt=''
      src='/logo_sign.svg'
      className='max-h-[1.6rem] min-w-[2.2rem]'
      
    /> : null}
  </Link>);
}
export default Logo;
