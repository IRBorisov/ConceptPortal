interface SelectorButtonProps
extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children' | 'title' | 'type'> {
  text?: string
  icon?: React.ReactNode
  tooltip?: string
  dimensions?: string
  borderClass?: string
  colors?: string
  transparent?: boolean
}


function SelectorButton({
  text, icon, tooltip,
  colors = 'clr-btn-default',
  dimensions = 'w-fit h-fit',
  transparent,
  ...props
}: SelectorButtonProps) {
  const cursor = 'disabled:cursor-not-allowed cursor-pointer';
  const position = `px-1 flex flex-start items-center gap-1 ${dimensions}`
  return (
    <button type='button'
      className={`text-sm small-caps ${!transparent && 'border'} ${cursor} ${position} text-btn text-controls select-none ${transparent ? 'clr-hover' : colors}`}
      title={tooltip}
      {...props}
    >
      {icon && icon}
      {text && <div className={'font-semibold whitespace-nowrap pb-1'}>{text}</div>}
    </button>
  );
}

export default SelectorButton;
