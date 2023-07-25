import { Link } from 'react-router-dom';

interface TextURLProps {
  text: string
  href: string
}

function TextURL({ text, href }: TextURLProps) {
  return (
    <Link className='text-sm font-bold text-blue-400 dark:text-orange-600 dark:hover:text-orange-400 hover:underline hover:text-blue-600' to={href}>
      {text}
    </Link>
  );
}

export default TextURL;
