import { useNavigation } from 'react-router';
import { useDebounce } from 'use-debounce';

import { Loader } from '@/components/loader';
import { ModalBackdrop } from '@/components/modal/modal-backdrop';
import { useTransitionTracker } from '@/hooks/use-transition-delay';
import { useAppTransitionStore } from '@/stores/app-transition';
import { PARAMETER } from '@/utils/constants';

export function GlobalLoader() {
  const navigation = useNavigation();

  const isTransitioning = useTransitionTracker();
  const isManualNav = useAppTransitionStore(state => state.isNavigating);
  const isRouterLoading = navigation.state === 'loading';

  const [loadingDebounced] = useDebounce(
    isRouterLoading || isTransitioning || isManualNav,
    PARAMETER.navigationPopupDelay
  );

  if (!loadingDebounced) {
    return null;
  }

  return (
    <div className='cc-modal-wrapper'>
      <ModalBackdrop />
      <div className='z-pop cc-fade-in px-10 border rounded-xl bg-background'>
        <Loader scale={6} />
      </div>
    </div>
  );
}
