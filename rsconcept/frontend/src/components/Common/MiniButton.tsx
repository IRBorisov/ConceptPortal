interface MiniButtonProps
extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'title' | 'children' > {
  icon: React.ReactNode
  tooltip?: string
  noHover?: boolean
  dimensions?: string
}

function MiniButton({
  icon, tooltip, noHover, tabIndex,
  dimensions='w-fit h-fit',
  ...props
}: MiniButtonProps) {
  return (
    <button type='button'
      title={tooltip}
      tabIndex={tabIndex ?? -1}
      className={`px-1 py-1 rounded-full cursor-pointer disabled:cursor-not-allowed clr-btn-clear ${noHover ? 'outline-none' : 'clr-hover'} ${dimensions}`}
      {...props}
    >
      {icon}
    </button>
  );
}

export default MiniButton;
