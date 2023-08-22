interface MiniButtonProps
extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'title' > {
  icon?: React.ReactNode
  tooltip?: string
  noHover?: boolean
}

function MiniButton({ icon, tooltip, children, noHover, ...props }: MiniButtonProps) {
  return (
    <button type='button'
      title={tooltip}
      className={`px-1 py-1 font-bold rounded-full cursor-pointer whitespace-nowrap disabled:cursor-not-allowed clr-btn-clear ${noHover ? '' : 'clr-hover'}`}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}

export default MiniButton;
