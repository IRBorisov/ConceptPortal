import { MouseEventHandler } from 'react'

interface ButtonProps {
  id?: string
  text?: string
  icon?: React.ReactNode
  tooltip?: string
  disabled?: boolean
  dense?: boolean
  loading?: boolean
  colorClass?: string
  borderClass?: string
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined
}

function Button({id, text, icon, tooltip,
  dense, disabled,
  colorClass, borderClass='border rounded',
  loading, onClick
}: ButtonProps) {
  const padding = dense ? 'px-1' : 'px-3 py-2'
  const cursor = 'disabled:cursor-not-allowed ' + (loading ? 'cursor-progress ': 'cursor-pointer ')
  const baseColor = 'dark:disabled:text-zinc-400 disabled:text-gray-400 bg-gray-100 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-400'
  const color = baseColor + ' ' + (colorClass || 'text-gray-500 dark:text-zinc-200')
  return (
    <button id={id}
      type='button'
      disabled={disabled}
      onClick={onClick}
      title={tooltip}
      className={padding + ' ' + borderClass + ' ' +
        'inline-flex items-center gap-2 align-middle justify-center w-fit h-fit ' + cursor + color
      }
    >
      {icon && <span>{icon}</span>}
      {text && <span className={'font-semibold'}>{text}</span>}
    </button>
  )
}

export default Button;