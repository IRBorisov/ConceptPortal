import { Loader } from '@/components/loader';

import { ModalBackdrop } from './modal-backdrop';

/** Full-screen loading overlay with backdrop and circular spinner. */
export function ModalLoader() {
  return (
    <div className='cc-modal-wrapper'>
      <ModalBackdrop />
      <div className='cc-animate-modal p-20 border-2 rounded-xl bg-background'>
        <Loader variant='circular' scale={6} />
      </div>
    </div>
  );
}
