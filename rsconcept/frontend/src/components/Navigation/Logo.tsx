import { Link } from 'react-router-dom';

import useWindowSize from '../../hooks/useWindowSize';

const HIDE_LOGO_TEXT_LIMIT = 700;

function Logo() {
  const windowSize = useWindowSize();

  return (
    <Link to='/' className='flex items-center h-full mr-2' tabIndex={-1}>
      { (windowSize.width && windowSize.width >= HIDE_LOGO_TEXT_LIMIT) && 
      <img alt=''
        src='/logo_full.svg'
        className='max-h-[1.6rem] min-w-[1.6rem]'
      />}
      { (!windowSize.width || windowSize.width < HIDE_LOGO_TEXT_LIMIT) && 
      <img alt=''
        src='/logo_sign.svg'
        className='max-h-[1.6rem] min-w-[2.2rem]'
        
      />}
    </Link>
  );
}
export default Logo;
