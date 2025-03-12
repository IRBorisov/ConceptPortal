import clsx from 'clsx';

import { type Button } from '../props';

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
export function SubmitButton({ text = 'ОК', icon, disabled, loading, className, ...restProps }: SubmitButtonProps) {
  return (
    <button
      type='submit'
      className={clsx(
        'px-3 py-1 flex gap-2 items-center justify-center',
        'border',
        'font-medium',
        'clr-btn-primary cc-animate-color',
        'select-none disabled:cursor-auto',
        loading && 'cursor-progress',
        className
      )}
      disabled={disabled || loading}
      {...restProps}
    >
      {icon ? icon : null}
      {text ? <span>{text}</span> : null}
    </button>
  );
}
