interface ToggleNavigationButtonProps {
  noNavigation?: boolean
  toggleNoNavigation: () => void
}

function ToggleNavigationButton({ noNavigation, toggleNoNavigation }: ToggleNavigationButtonProps) {
  if (noNavigation) {
    return (
    <button type='button' tabIndex={-1}
      title='Показать навигацию'
      className='absolute top-0 right-0 z-navigation px-1 h-[1.6rem] border-b-2 border-l-2 clr-btn-nav rounded-none'
      onClick={toggleNoNavigation}
    >
      {'∨∨∨'}
    </button>);
  } else {
    return (
    <button type='button' tabIndex={-1}
      title='Скрыть навигацию'
      className='absolute top-0 right-0 z-navigation w-[1.2rem] h-[3rem] border-b-2 border-l-2 clr-btn-nav rounded-none'
      onClick={toggleNoNavigation}
    >
      <p>{'>'}</p><p>{'>'}</p>
    </button>);
  }
}

export default ToggleNavigationButton;