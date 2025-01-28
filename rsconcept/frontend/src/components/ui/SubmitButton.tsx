import clsx from 'clsx';

import { CProps } from '@/components/props';

interface SubmitButtonProps extends CProps.Button {
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
function SubmitButton({ text = 'ОК', icon, disabled, loading, className, ...restProps }: SubmitButtonProps) {
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
      {icon ? <span>{icon}</span> : null}
      {text ? <span>{text}</span> : null}
    </button>
  );
}

export default SubmitButton;
