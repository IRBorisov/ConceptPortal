'use client';

import { useRef } from 'react';

import useEscapeKey from '@/hooks/useEscapeKey';

import { CrossIcon } from '../Icons';
import Button from './Button';
import MiniButton from './MiniButton';
import Overlay from './Overlay';

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
  className?: string
}

function Modal({ 
  title, hideWindow, onSubmit,
  readonly, onCancel, canSubmit,
  submitInvalidTooltip, className,
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
    <div className='fixed top-0 left-0 w-full h-full z-navigation clr-modal-backdrop' />
    <div ref={ref}
      className='fixed -translate-x-1/2 translate-y-1/2 border shadow-md bottom-1/2 left-1/2 z-modal clr-app'
    >
      <Overlay position='right-[0.3rem] top-2' className='text-disabled'>
        <MiniButton
          tooltip='Закрыть диалоговое окно [ESC]'
          icon={<CrossIcon size={5}/>}
          onClick={handleCancel}
        />
      </Overlay>
      
      {title ? <h1 className='px-12 py-2 text-lg select-none'>{title}</h1> : null}

      <div
        className={`w-full h-fit ${className}`}
        style={{
          maxHeight: 'calc(100vh - 8rem)',
          maxWidth: 'calc(100vw - 2rem)',
          overflow: 'auto'
        }}
      >
        {children}
      </div>

      <div className='flex justify-center w-full gap-12 px-6 py-3 z-modal-controls min-w-fit'>
        {!readonly ? 
        <Button autoFocus
          text={submitText}
          tooltip={!canSubmit ? submitInvalidTooltip: ''}
          dimensions='min-w-[8rem] min-h-[2.6rem]'
          colors='clr-btn-primary'
          disabled={!canSubmit}
          onClick={handleSubmit}
        /> : null}
        <Button
          text={readonly ? 'Закрыть' : 'Отмена'}
          dimensions='min-w-[8rem] min-h-[2.6rem]'
          onClick={handleCancel}
        />
      </div>
    </div>
  </>);
}

export default Modal;
