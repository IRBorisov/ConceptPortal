import { Link } from 'react-router-dom';

interface LogoProps {
  title: string
}

function Logo({title}: LogoProps) {
  return (
    <Link to='/' className='flex items-center mr-4'>
      <img src='/favicon.svg' className='h-10 mr-2' alt=''/>
      <span className='hidden lg:block self-center text-2xl font-semibold whitespace-nowrap dark:text-white'>{title}</span>
    </Link>
  );
}
export default Logo;