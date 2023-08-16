import { Link } from 'react-router-dom';

interface TextURLProps {
  text: string
  href: string
}

function TextURL({ text, href }: TextURLProps) {
  return (
    <Link className='font-bold hover:underline clr-text' to={href}>
      {text}
    </Link>
  );
}

export default TextURL;
