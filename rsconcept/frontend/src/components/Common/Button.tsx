import { type MouseEventHandler } from 'react';

interface ButtonProps {
  id?: string
  text?: string
  icon?: React.ReactNode
  tooltip?: string
  disabled?: boolean
  dense?: boolean
  loading?: boolean
  widthClass?: string
  borderClass?: string
  colorClass?: string
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined
}

function Button({
  id, text, icon, tooltip,
  dense, disabled,
  borderClass = 'border rounded', colorClass = 'clr-btn-default', widthClass = 'w-fit h-fit',
  loading, onClick,
  ...props
}: ButtonProps) {
  const padding = dense ? 'px-1' : 'px-3 py-2';
  const cursor = 'disabled:cursor-not-allowed ' + (loading ? 'cursor-progress ' : 'cursor-pointer ');
  return (
    <button id={id}
      type='button'
      disabled={disabled}
      onClick={onClick}
      title={tooltip}
      className={`inline-flex items-center gap-2 align-middle justify-center ${padding} ${borderClass} ${colorClass} ${widthClass} ${cursor}`}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {text && <span className={'font-semibold'}>{text}</span>}
    </button>
  );
}

export default Button;
