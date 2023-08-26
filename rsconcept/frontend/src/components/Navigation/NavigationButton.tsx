interface NavigationButtonProps {
  id?: string
  text?: string
  icon: React.ReactNode
  description?: string
  onClick?: () => void
}

function NavigationButton({ id, icon, description, onClick, text }: NavigationButtonProps) {
  return (
    <button id={id}
      title={description}
      type='button'
      onClick={onClick}
      className='flex gap-1 p-2 mr-1 rounded-lg min-w-fit whitespace-nowrap clr-btn-nav'
    >
      {icon && <span>{icon}</span>}
      {text && <span className='font-semibold'>{text}</span>}
    </button>
  );
}

export default NavigationButton;
