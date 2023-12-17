'use client';

import clsx from 'clsx';
import { useRef } from 'react';
import { BiX } from 'react-icons/bi';

import useEscapeKey from '@/hooks/useEscapeKey';

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
    <div className={clsx(
      'z-navigation',
      'fixed top-0 left-0',
      'w-full h-full',
      'clr-modal-backdrop'
    )}/>
    <div ref={ref}
      className={clsx(
        'z-modal',
        'fixed bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2',
        'border shadow-md',
        'clr-app'
      )}
    >
      <Overlay position='right-[0.3rem] top-2'>
        <MiniButton
          tooltip='Закрыть диалоговое окно [ESC]'
          icon={<BiX size='1.25rem'/>}
          onClick={handleCancel}
        />
      </Overlay>
      
      {title ? <h1 className='px-12 py-2 select-none'>{title}</h1> : null}

      <div
        className={clsx(
          'w-full h-fit',
          'overflow-auto',
          className
        )}
        style={{
          maxHeight: 'calc(100vh - 8rem)',
          maxWidth: 'calc(100vw - 2rem)',
        }}
      >
        {children}
      </div>

      <div className={clsx(
        'w-full min-w-fit',
        'z-modal-controls',
        'px-6 py-3 flex gap-12 justify-center'
      )}>
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