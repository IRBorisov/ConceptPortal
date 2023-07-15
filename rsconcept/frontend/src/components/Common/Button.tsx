interface ButtonProps {
  text?: string
  icon?: React.ReactNode
  tooltip?: string
  disabled?: boolean
  dense?: boolean
  loading?: boolean
  colorClass?: string
  onClick?: () => void
}

function Button({text, icon, dense=false, disabled=false, tooltip, colorClass, loading, onClick}: ButtonProps) {
  const padding = dense ? 'px-1 py-1' : 'px-3 py-2 '
  const cursor = 'disabled:cursor-not-allowed ' + (loading ? 'cursor-progress ': 'cursor-pointer ')
  const baseColor = 'dark:disabled:text-gray-800 disabled:text-gray-400 bg-gray-200 hover:bg-gray-300 dark:bg-gray-500 dark:hover:bg-gray-400'
  const color = baseColor + ' ' + (colorClass || 'text-gray-600 dark:text-zinc-50')
  return (
    <button
      type='button'
      disabled={disabled}
      onClick={onClick}
      title={tooltip}
      className={padding + 
        'inline-flex items-center  border rounded ' + cursor + color
      }
    >
      <span>{icon}</span>
      {text && <span className={'font-bold' + (icon ? ' ml-2': '')}>{text}</span>}
    </button>
  )
}

export default Button;