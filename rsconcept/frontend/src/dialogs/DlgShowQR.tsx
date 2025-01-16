'use client';

import clsx from 'clsx';
import { QRCodeSVG } from 'qrcode.react';

import Modal from '@/components/ui/Modal';
import { useDialogsStore } from '@/stores/dialogs';

export interface DlgShowQRProps {
  target: string;
}

function DlgShowQR() {
  const { target } = useDialogsStore(state => state.props as DlgShowQRProps);
  return (
    <Modal readonly className={clsx('w-[30rem]', 'py-12 pr-3 pl-6 flex gap-3 justify-center items-center')}>
      <div className='bg-[#ffffff] p-4 border'>
        <QRCodeSVG value={target} size={256} />
      </div>
    </Modal>
  );
}

export default DlgShowQR;
