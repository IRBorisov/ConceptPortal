'use client';

import Modal, { ModalProps } from '@/components/ui/Modal';
import { IArgumentInfo } from '@/models/rslang';

interface DlgShowTypificationProps extends Pick<ModalProps, 'hideWindow'> {
  result: string;
  args: IArgumentInfo[];
}

function DlgShowTypification({ hideWindow, result, args }: DlgShowTypificationProps) {
  console.log(result, args);
  return (
    <Modal
      header='Структура типизации'
      readonly
      hideWindow={hideWindow}
      className='flex flex-col justify-stretch w-[calc(100dvw-3rem)] h-[calc(100dvh-6rem)]'
    >
      <div>В разработке...</div>
    </Modal>
  );
}

export default DlgShowTypification;
