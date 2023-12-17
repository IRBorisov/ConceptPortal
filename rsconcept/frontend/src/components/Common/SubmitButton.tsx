import clsx from 'clsx';

interface SubmitButtonProps
extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'title'> {
  text?: string
  tooltip?: string
  loading?: boolean
  icon?: React.ReactNode
  dimensions?: string
}

function SubmitButton({
  text = 'ОК', icon, disabled, tooltip, loading, className,
  dimensions = 'w-fit h-fit', ...restProps
}: SubmitButtonProps) {
  return (
  <button type='submit'
    title={tooltip}
    className={clsx(
      'px-3 py-2 inline-flex items-center gap-2 align-middle justify-center',
      'border',
      'font-semibold',
      'clr-btn-primary',
      'select-none disabled:cursor-not-allowed',
      loading && 'cursor-progress',
      dimensions,
      className
    )}
    disabled={disabled ?? loading}
    {...restProps}
  >
    {icon ? <span>{icon}</span> : null}
    {text ? <span>{text}</span> : null}
  </button>);
}

export default SubmitButton;