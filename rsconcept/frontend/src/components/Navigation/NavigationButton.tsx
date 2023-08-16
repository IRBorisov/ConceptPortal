interface NavigationButtonProps {
  id?: string
  icon: React.ReactNode
  description?: string
  colorClass?: string
  onClick?: () => void
}

const defaultColors = 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'

function NavigationButton({ id, icon, description, colorClass = defaultColors, onClick }: NavigationButtonProps) {
  return (
    <button id={id}
      title={description}
      type='button'
      onClick={onClick}
      className={'min-w-fit p-2 mr-1 focus:ring-4 rounded-lg focus:ring-gray-300 dark:focus:ring-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 ' + colorClass}
    >
      {icon}
    </button>
  );
}

export default NavigationButton;
