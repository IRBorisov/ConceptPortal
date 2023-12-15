import clsx from 'clsx';
import { useMemo } from 'react';

import { useConceptTheme } from '@/context/ThemeContext';

function ToggleNavigationButton() {
  const { noNavigation, toggleNoNavigation } = useConceptTheme();
  const text = useMemo(() => (
    noNavigation ?
      '∨∨∨'
      :
      <>
        <p>{'>'}</p>
        <p>{'>'}</p>
      </>
    ), [noNavigation]
  );
  return (
  <button type='button' tabIndex={-1}
    title={noNavigation ? 'Показать навигацию' : 'Скрыть навигацию'}
    className={clsx(
      'absolute top-0 right-0 z-navigation',
      'border-b-2 border-l-2 rounded-none',
      'clr-btn-nav',
      {
        'px-1 h-[1.6rem]': noNavigation,
        'w-[1.2rem] h-[3rem]': !noNavigation
      }
    )}
    onClick={toggleNoNavigation}
  >
    {text}
  </button>);
}

export default ToggleNavigationButton;