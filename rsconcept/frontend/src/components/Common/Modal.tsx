import { useRef } from 'react';

import useEscapeKey from '../../hooks/useEscapeKey';
import Button from './Button';

interface ModalProps {
  title?: string
  submitText?: string
  submitInvalidTooltip?: string
  readonly?: boolean
  canSubmit?: boolean
  hideWindow: () => void
  onSubmit?: () => void
  onCancel?: () => void
  children: React.ReactNode
}

function Modal({ 
  title, hideWindow, onSubmit,
  readonly, onCancel, canSubmit,
  submitInvalidTooltip,
  children,
  submitText = 'Продолжить'
}: ModalProps) {
  const ref = useRef(null);
  useEscapeKey(hideWindow);

  const handleCancel = () => {
    hideWindow();
    if (onCancel) onCancel();
  };

  const handleSubmit = () => {
    hideWindow();
    if (onSubmit) onSubmit();
  };

  return (
    <>
    <div className='fixed top-0 left-0 z-50 w-full h-full clr-modal-backdrop' />
    <div 
      ref={ref}
      className='fixed bottom-1/2 left-1/2 translate-y-1/2 -translate-x-1/2 px-6 py-4 flex flex-col w-fit max-w-[95vw] h-fit z-[60] clr-app border shadow-md mb-[5rem]'
    >
      { title && <h1 className='mb-2 text-xl'>{title}</h1> }
      <div className='max-h-[calc(95vh-15rem)]'>
        {children}
      </div>
      <div className='flex justify-center w-full gap-4 pt-4 mt-2 border-t-2'>
        {!readonly && 
        <Button
          text={submitText}
          tooltip={!canSubmit ? submitInvalidTooltip: ''}
          widthClass='min-w-[6rem] min-h-[2.6rem] w-fit h-fit'
          colorClass='clr-btn-primary'
          disabled={!canSubmit}
          onClick={handleSubmit}
          autoFocus
        />}
        <Button
          text={readonly ? 'Закрыть' : 'Отмена'}
          widthClass='min-w-[6rem] min-h-[2.6rem] w-fit h-fit'
          onClick={handleCancel}
        />
      </div>
    </div>
    </>
  );
}

export default Modal;
