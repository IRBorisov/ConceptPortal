import { Link } from 'react-router-dom';

interface TextURLProps {
  text: string;
  title?: string;
  href?: string;
  color?: string;
  onClick?: () => void;
}

function TextURL({ text, href, title, color = 'clr-text-url', onClick }: TextURLProps) {
  const design = `cursor-pointer hover:underline ${color}`;
  if (href) {
    return (
      <Link tabIndex={-1} className={design} title={title} to={href}>
        {text}
      </Link>
    );
  } else if (onClick) {
    return (
      <button type='button' tabIndex={-1} className={design} onClick={onClick}>
        {text}
      </button>
    );
  } else {
    return null;
  }
}

export default TextURL;
