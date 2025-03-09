import { useWindowSize } from '@/hooks/useWindowSize';
import { usePreferencesStore } from '@/stores/preferences';

export function Logo() {
  const darkMode = usePreferencesStore(state => state.darkMode);
  const size = useWindowSize();

  return (
    <img
      alt=''
      className='max-h-7 w-fit max-w-46'
      src={size.isSmall ? '/logo_sign.svg' : !darkMode ? '/logo_full.svg' : '/logo_full_dark.svg'}
    />
  );
}
