import { Link } from 'react-router';

interface TextURLProps {
  /** Text to display. */
  text: string;

  /** Tooltip for the link. */
  title?: string;

  /** URL to link to. */
  href?: string;

  /** Color of the link. */
  color?: string;

  /** Callback to be called when the link is clicked. */
  onClick?: () => void;
}

/**
 * Displays a text with a clickable link.
 */
export function TextURL({ text, href, title, color = 'text-primary', onClick }: TextURLProps) {
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
