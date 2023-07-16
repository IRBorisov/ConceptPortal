interface NavigationTextItemProps {
  text?: string | undefined
  description?: string | undefined
  onClick: () => void
  bold?: boolean
}

function NavigationTextItem({text='', description='', onClick, bold}: NavigationTextItemProps) {
  return (
    <button 
      title={description}
      onClick={onClick}
      className={(bold ? 'font-bold ': '') + 'px-4 py-1 hover:bg-gray-50 hover:text-gray-700 dark:hover:text-white dark:hover:bg-gray-500 overflow-ellipsis text-left'}>
      {text}
    </button>
  );
}

export default NavigationTextItem;