import clsx from 'clsx';

import { CProps } from '../props';

interface SubmitButtonProps extends CProps.Button {
  text?: string;
  loading?: boolean;
  icon?: React.ReactNode;
}

function SubmitButton({ text = 'ОК', icon, disabled, loading, className, ...restProps }: SubmitButtonProps) {
  return (
    <button
      type='submit'
      className={clsx(
        'px-3 py-1 flex gap-2 items-center justify-center',
        'border',
        'font-medium',
        'clr-btn-primary',
        'select-none disabled:cursor-not-allowed',
        loading && 'cursor-progress',
        className
      )}
      disabled={disabled ?? loading}
      {...restProps}
    >
      {icon ? <span>{icon}</span> : null}
      {text ? <span>{text}</span> : null}
    </button>
  );
}

export default SubmitButton;
