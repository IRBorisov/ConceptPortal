'use client';

import { useWindowSize } from '@/hooks/use-window-size';
import { usePreferencesStore } from '@/stores/preferences';

export function Logo() {
  const darkMode = usePreferencesStore(state => state.darkMode);
  const size = useWindowSize();

  return (
    <img
      alt=''
      aria-hidden
      className='max-h-7 w-fit max-w-46 cursor-pointer'
      src={size.isSmall ? '/logo_sign.svg' : !darkMode ? '/logo_full.svg' : '/logo_full_dark.svg'}
    />
  );
}
