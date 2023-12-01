import { useRef } from 'react';

import useEscapeKey from '../../hooks/useEscapeKey';
import Button from './Button';

export interface ModalProps {
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

  return (<>
    <div className='fixed top-0 left-0 w-full h-full z-navigation clr-modal-backdrop' />
    <div ref={ref}
      className='fixed bottom-1/2 left-1/2 translate-y-1/2 -translate-x-1/2 px-4 flex flex-col justify-start w-fit max-w-[calc(100vw-2rem)] overflow-x-auto h-fit z-modal clr-app border shadow-md'
    >
      {title ? <h1 className='py-2 text-lg select-none'>{title}</h1> : null}
      <div className='max-h-[calc(100vh-8rem)] overflow-auto px-2'>
        {children}
      </div>
      <div className='flex justify-center w-full gap-6 py-3 z-modal-controls'>
        {!readonly ? 
        <Button autoFocus
          text={submitText}
          tooltip={!canSubmit ? submitInvalidTooltip: ''}
          dimensions='min-w-[8rem] min-h-[2.6rem] w-fit h-fit'
          colors='clr-btn-primary'
          disabled={!canSubmit}
          onClick={handleSubmit}
        /> : null}
        <Button
          text={readonly ? 'Закрыть' : 'Отмена'}
          dimensions='min-w-[8rem] min-h-[2.6rem] w-fit h-fit'
          onClick={handleCancel}
        />
      </div>
    </div>
  </>);
}

export default Modal;
