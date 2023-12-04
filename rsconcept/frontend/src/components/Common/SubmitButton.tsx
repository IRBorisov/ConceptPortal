interface SubmitButtonProps
extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children' | 'title'> {
  text?: string
  tooltip?: string
  loading?: boolean
  icon?: React.ReactNode
  dimensions?: string
}

function SubmitButton({
  text = 'ОК', icon, disabled, tooltip, loading,
  dimensions = 'w-fit h-fit', ...restProps
}: SubmitButtonProps) {
  return (
  <button type='submit'
    title={tooltip}
    className={`px-3 py-2 inline-flex items-center gap-2 align-middle justify-center font-semibold select-none disabled:cursor-not-allowed border clr-btn-primary ${dimensions} ${loading ? ' cursor-progress' : ''}`}
    disabled={disabled ?? loading}
    {...restProps}
  >
    {icon ? <span>{icon}</span> : null}
    {text ? <span>{text}</span> : null}
  </button>);
}

export default SubmitButton;
