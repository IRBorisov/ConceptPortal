interface NavigationButtonProps {
  id?: string
  text?: string
  icon: React.ReactNode
  description?: string
  onClick?: () => void
}

function NavigationButton({ id, icon, description, onClick, text }: NavigationButtonProps) {
  return (
  <button id={id} type='button' tabIndex={-1}
    title={description}
    onClick={onClick}
    className={`flex items-center h-full gap-1 ${text ? 'px-2' : 'px-4'} mr-1 small-caps whitespace-nowrap clr-btn-nav`}
  >
    {icon ? <span>{icon}</span> : null}
    {text ? <span className='font-semibold'>{text}</span> : null}
  </button>);
}

export default NavigationButton;
