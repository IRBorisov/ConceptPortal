'use client';

import clsx from 'clsx';
import { QRCodeSVG } from 'qrcode.react';

import { ModalView } from '@/components/Modal';
import { useDialogsStore } from '@/stores/dialogs';

export interface DlgShowQRProps {
  target: string;
}

function DlgShowQR() {
  const { target } = useDialogsStore(state => state.props as DlgShowQRProps);
  return (
    <ModalView className={clsx('w-[30rem]', 'py-12 pr-3 pl-6 flex gap-3 justify-center items-center')}>
      <div className='bg-[#ffffff] p-4 border'>
        <QRCodeSVG value={target} size={256} />
      </div>
    </ModalView>
  );
}

export default DlgShowQR;
