'use client';

import { QRCodeSVG } from 'qrcode.react';

import { ModalView } from '@/components/Modal';
import { useDialogsStore } from '@/stores/dialogs';

export interface DlgShowQRProps {
  target: string;
}

export function DlgShowQR() {
  const { target } = useDialogsStore(state => state.props as DlgShowQRProps);
  return (
    <ModalView className='w-100 pb-6 pt-12 flex justify-center items-center'>
      <div className='bg-[#ffffff] p-4 border'>
        <QRCodeSVG value={target} size={256} />
      </div>
    </ModalView>
  );
}
