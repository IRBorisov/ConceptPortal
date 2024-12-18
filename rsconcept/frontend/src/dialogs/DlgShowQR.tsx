'use client';

import clsx from 'clsx';
import { QRCodeSVG } from 'qrcode.react';

import Modal, { ModalProps } from '@/components/ui/Modal';

interface DlgShowQRProps extends Pick<ModalProps, 'hideWindow'> {
  target: string;
}

function DlgShowQR({ hideWindow, target }: DlgShowQRProps) {
  return (
    <Modal
      readonly
      hideWindow={hideWindow}
      className={clsx('w-[30rem]', 'py-12 pr-3 pl-6 flex gap-3 justify-center items-center')}
    >
      <div className='bg-[#ffffff] p-4 border'>
        <QRCodeSVG value={target} size={256} />
      </div>
    </Modal>
  );
}

export default DlgShowQR;
