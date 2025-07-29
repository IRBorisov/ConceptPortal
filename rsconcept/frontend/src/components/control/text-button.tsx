import { globalIDs } from '@/utils/constants';

import { type Button as ButtonStyle } from '../props';
import { cn } from '../utils';

interface TextButtonProps extends ButtonStyle {
  /** Text to display second. */
  text: string;
}

/**
 * Customizable `button` with text, transparent background and no additional styling.
 */
export function TextButton({ text, title, titleHtml, hideTitle, className, ...restProps }: TextButtonProps) {
  return (
    <button
      tabIndex={-1}
      type='button'
      className={cn(
        'self-start cc-label cc-hover-underline',
        'font-medium text-primary select-none disabled:text-foreground',
        'cursor-pointer disabled:cursor-default',
        'outline-hidden',
        'select-text',
        className
      )}
      data-tooltip-id={!!title || !!titleHtml ? globalIDs.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      aria-label={!text ? title : undefined}
      {...restProps}
    >
      {text}
    </button>
  );
}
