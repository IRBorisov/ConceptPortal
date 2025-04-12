import { Loader } from '@/components/loader';

import { ModalBackdrop } from './modal-backdrop';

export function ModalLoader() {
  return (
    <div className='cc-modal-wrapper'>
      <ModalBackdrop />
      <div className='cc-animate-modal p-20 border rounded-xl bg-background'>
        <Loader circular scale={6} />
      </div>
    </div>
  );
}
