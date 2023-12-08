import { Link } from 'react-router-dom';

interface TextURLProps {
  text: string
  tooltip?: string
  href?: string
  color?: string
  onClick?: () => void
}

function TextURL({ text, href, tooltip, color='text-url', onClick }: TextURLProps) {
  const design = `cursor-pointer hover:underline ${color}`;
  if (href) {
    return (
    <Link
      className={design}
      title={tooltip}
      to={href}
      tabIndex={-1}
    >
      {text}
    </Link>
    );
  } else if (onClick) {
    return (
    <span
      className={design}
      onClick={onClick}
      tabIndex={-1}
    >
      {text}
    </span>);
  } else {
    return null;
  }
}

export default TextURL;
