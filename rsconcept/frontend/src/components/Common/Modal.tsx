import { useRef } from 'react';

import useClickedOutside from '../../hooks/useClickedOutside';
import useEscapeKey from '../../hooks/useEscapeKey';
import Button from './Button';

interface ModalProps {
  title?: string
  submitText?: string
  show: boolean
  canSubmit: boolean
  hideWindow: () => void
  onSubmit: () => void
  onCancel?: () => void
  children: React.ReactNode
}

function Modal({ title, show, hideWindow, onSubmit, onCancel, canSubmit, children, submitText = 'Продолжить' }: ModalProps) {
  const ref = useRef(null);
  useClickedOutside({ ref, callback: hideWindow });
  useEscapeKey(hideWindow);

  if (!show) {
    return null;
  }

  const handleCancel = () => {
    hideWindow();
    if (onCancel) onCancel();
  };

  const handleSubmit = () => {
    hideWindow();
    onSubmit();
  };

  return (
    <>
    <div className='fixed top-0 left-0 z-50 w-full h-full opacity-50 clr-modal'>
    </div>
    <div ref={ref} className='fixed bottom-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 px-6 py-4 flex flex-col w-fit z-[60] clr-card border shadow-md'>
      { title && <h1 className='mb-4 text-xl font-bold text-center'>{title}</h1> }
      <div className='py-2'>
        {children}
      </div>
      <div className='flex justify-between w-full pt-4 mt-2 border-t-4'>
        <Button
          text={submitText}
          widthClass='min-w-[6rem] w-fit h-fit'
          colorClass='clr-btn-primary'
          disabled={!canSubmit}
          onClick={handleSubmit}
          autoFocus
        />
        <Button
          text='Отмена'
          onClick={handleCancel}
        />
      </div>
    </div>
    </>
  );
}

export default Modal;
