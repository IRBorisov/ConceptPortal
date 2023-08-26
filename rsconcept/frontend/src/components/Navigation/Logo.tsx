import { Link } from 'react-router-dom';

interface LogoProps {
  title: string
}

function Logo({ title }: LogoProps) {
  return (
    <Link to='/' className='flex items-center mr-4' tabIndex={-1}>
      <img src='/favicon.svg' className='min-h-[2rem] mr-2 min-w-[2rem]' alt=''/>
      <span className='self-center hidden text-xl font-semibold lg:block whitespace-nowrap dark:text-white'>{title}</span>
    </Link>
  );
}
export default Logo;
