import { Link } from 'react-router-dom';

interface TextURLProps {
  text: string
  tooltip?: string
  href?: string
  onClick?: () => void
}

function TextURL({ text, href, tooltip, onClick }: TextURLProps) {
  if (href) {
    return (
    <Link
      className='cursor-pointer hover:underline text-url'
      title={tooltip}
      to={href}
    >
      {text}
    </Link>
    );
  } else if (onClick) {
    return (
    <span
      className='cursor-pointer hover:underline text-url'
      onClick={onClick}
    >
      {text}
    </span>);
  } else {
    return null;
  }
}

export default TextURL;
