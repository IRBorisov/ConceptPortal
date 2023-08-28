import { Link } from 'react-router-dom';

interface TextURLProps {
  text: string
  href: string
}

function TextURL({ text, href }: TextURLProps) {
  return (
    <Link className='hover:underline text-url' to={href}>
      {text}
    </Link>
  );
}

export default TextURL;
