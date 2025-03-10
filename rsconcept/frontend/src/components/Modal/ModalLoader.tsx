import { Loader } from '@/components/Loader';

import { ModalBackdrop } from './ModalBackdrop';

export function ModalLoader() {
  return (
    <div className='cc-modal-wrapper'>
      <ModalBackdrop />
      <div className='cc-animate-modal p-20 border rounded-xl bg-prim-100'>
        <Loader circular scale={6} />
      </div>
    </div>
  );
}
