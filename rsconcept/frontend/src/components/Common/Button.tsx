interface ButtonProps
extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children' | 'title'> {
  text?: string
  icon?: React.ReactNode
  tooltip?: string
  dense?: boolean
  loading?: boolean
  widthClass?: string
  borderClass?: string
  colorClass?: string
}

function Button({
  id, text, icon, tooltip,
  dense, disabled,
  borderClass = 'border rounded',
  colorClass = 'clr-btn-default',
  widthClass = 'w-fit h-fit',
  loading, onClick,
  ...props
}: ButtonProps) {
  const padding = dense ? 'px-1' : 'px-3 py-2';
  const cursor = 'disabled:cursor-not-allowed ' + (loading ? 'cursor-progress ' : 'cursor-pointer ');
  return (
    <button id={id}
      type='button'
      disabled={disabled ?? loading}
      onClick={onClick}
      title={tooltip}
      className={`inline-flex items-center gap-2 align-middle justify-center select-none ${padding} ${colorClass} ${widthClass} ${borderClass} ${cursor}`}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {text && <span className={'font-semibold'}>{text}</span>}
    </button>
  );
}

export default Button;
