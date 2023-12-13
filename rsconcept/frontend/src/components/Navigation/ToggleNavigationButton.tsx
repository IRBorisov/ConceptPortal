import { useMemo } from 'react';

import { useConceptTheme } from '@/context/ThemeContext';

function ToggleNavigationButton() {
  const { noNavigation, toggleNoNavigation } = useConceptTheme();
  const dimensions = useMemo(() => (noNavigation ? 'px-1 h-[1.6rem]' : 'w-[1.2rem] h-[3rem]'), [noNavigation]);
  const text = useMemo(() => (
    noNavigation ? '∨∨∨' : <><p>{'>'}</p><p>{'>'}</p></>), [noNavigation]
  );
  const tooltip = useMemo(() => (noNavigation ? 'Показать навигацию' : 'Скрыть навигацию'), [noNavigation]);

  return (
  <button type='button' tabIndex={-1}
    title={tooltip}
    className={`absolute top-0 right-0 border-b-2 border-l-2 rounded-none z-navigation clr-btn-nav ${dimensions}`}
    onClick={toggleNoNavigation}
  >
    {text}
  </button>);
}

export default ToggleNavigationButton;