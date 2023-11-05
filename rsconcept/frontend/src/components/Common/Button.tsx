import { IColorsProps, IControlProps } from '../commonInterfaces'

interface ButtonProps
extends IControlProps, IColorsProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children' | 'title'| 'type'> {
  text?: string
  icon?: React.ReactNode

  dense?: boolean
  loading?: boolean
}

function Button({
  text, icon, tooltip,
  dense, disabled, noBorder, noOutline,
  colors = 'clr-btn-default',
  dimensions = 'w-fit h-fit',
  loading,
  ...props
}: ButtonProps) {
  const borderClass = noBorder ? '' : 'border rounded';
  const padding = dense ? 'px-1' : 'px-3 py-2';
  const outlineClass = noOutline ? 'outline-none': 'clr-outline';
  const cursor = 'disabled:cursor-not-allowed ' + (loading ? 'cursor-progress ' : 'cursor-pointer ');
  return (
    <button type='button'
      disabled={disabled ?? loading}
      title={tooltip}
      className={`inline-flex items-center gap-2 align-middle justify-center select-none ${padding} ${colors} ${outlineClass} ${borderClass} ${dimensions} ${cursor}`}
      {...props}
    >
      {icon && icon}
      {text && <span className='font-semibold'>{text}</span>}
    </button>
  );
}

export default Button;
