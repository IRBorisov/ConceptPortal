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
      className={`flex items-center h-full gap-1 ${text ? 'px-2' : 'px-4'} mr-1 min-w-fit whitespace-nowrap clr-btn-nav`}
    >
      {icon && <span>{icon}</span>}
      {text && <span className='font-semibold'>{text}</span>}
    </button>
  );
}

export default NavigationButton;
