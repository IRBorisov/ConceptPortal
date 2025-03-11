import { useNavigation } from 'react-router';
import { useDebounce } from 'use-debounce';

import { Loader } from '@/components/Loader';
import { ModalBackdrop } from '@/components/Modal/ModalBackdrop';
import { PARAMETER } from '@/utils/constants';

export function GlobalLoader() {
  const navigation = useNavigation();

  const isLoading = navigation.state === 'loading';
  const [loadingDebounced] = useDebounce(isLoading, PARAMETER.navigationPopupDelay);

  if (!loadingDebounced) {
    return null;
  }

  return (
    <div className='cc-modal-wrapper'>
      <ModalBackdrop />
      <div className='z-pop cc-fade-in px-10 border rounded-xl bg-prim-100'>
        <Loader scale={6} />
      </div>
    </div>
  );
}
