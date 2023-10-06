interface ButtonProps
extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children' | 'title'| 'type'> {
  text?: string
  icon?: React.ReactNode
  tooltip?: string
  dense?: boolean
  loading?: boolean
  dimensions?: string
  borderClass?: string
  colorClass?: string
}

function Button({
  text, icon, tooltip,
  dense, disabled,
  borderClass = 'border rounded',
  colorClass = 'clr-btn-default',
  dimensions = 'w-fit h-fit',
  loading,
  ...props
}: ButtonProps) {
  const padding = dense ? 'px-1' : 'px-3 py-2';
  const cursor = 'disabled:cursor-not-allowed ' + (loading ? 'cursor-progress ' : 'cursor-pointer ');
  return (
    <button type='button'
      disabled={disabled ?? loading}
      title={tooltip}
      className={`inline-flex items-center gap-2 align-middle justify-center select-none ${padding} ${colorClass} ${dimensions} ${borderClass} ${cursor}`}
      {...props}
    >
      {icon && icon}
      {text && <span className={'font-semibold'}>{text}</span>}
    </button>
  );
}

export default Button;
