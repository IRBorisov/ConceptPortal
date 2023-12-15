import clsx from 'clsx';

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
    className={clsx(
      'mr-1 h-full',
      'flex items-center gap-1',
      'clr-btn-nav',
      'small-caps whitespace-nowrap',
      {
        'px-2': text,
        'px-4': !text
      }
    )}
  >
    {icon ? <span>{icon}</span> : null}
    {text ? <span className='font-semibold'>{text}</span> : null}
  </button>);
}

export default NavigationButton;