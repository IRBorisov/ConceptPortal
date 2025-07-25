import { globalIDs } from '@/utils/constants';

import { type Button } from '../props';
import { cn } from '../utils';

interface SubmitButtonProps extends Button {
  /** Text to display in the button. */
  text?: string;

  /** Icon to display in the button. */
  icon?: React.ReactNode;

  /** Indicates that loading is in progress. */
  loading?: boolean;
}

/**
 * Displays submit type button with icon and text.
 */
export function SubmitButton({
  text = 'ОК',
  icon,
  title,
  titleHtml,
  hideTitle,
  disabled,
  loading,
  className,
  ...restProps
}: SubmitButtonProps) {
  return (
    <button
      type='submit'
      className={cn(
        'px-3 py-1 flex gap-2 items-center justify-center',
        'border',
        'font-medium',
        'cc-btn-primary disabled:opacity-50 cc-animate-color',
        'select-none cursor-pointer disabled:cursor-auto',
        loading && 'cursor-progress',
        className
      )}
      data-tooltip-id={!!title || !!titleHtml ? globalIDs.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      disabled={disabled || loading}
      {...restProps}
    >
      {icon ? icon : null}
      {text ? <span>{text}</span> : null}
    </button>
  );
}
