'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useRef } from 'react';

import useEscapeKey from '@/hooks/useEscapeKey';
import { animateModal } from '@/styling/animations';
import { prepareTooltip } from '@/utils/labels';

import { IconClose } from '../Icons';
import { CProps } from '../props';
import Button from './Button';
import MiniButton from './MiniButton';
import Overlay from './Overlay';

export interface ModalProps extends CProps.Styling {
  header?: string;
  submitText?: string;
  submitInvalidTooltip?: string;

  readonly?: boolean;
  canSubmit?: boolean;
  overflowVisible?: boolean;

  hideWindow: () => void;
  onSubmit?: () => void;
  onCancel?: () => void;

  children: React.ReactNode;
}

function Modal({
  header,
  hideWindow,
  onSubmit,
  readonly,
  onCancel,
  canSubmit,
  submitInvalidTooltip,
  className,
  children,
  overflowVisible,
  submitText = 'Продолжить',
  ...restProps
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
    <div className='fixed top-0 left-0 w-full h-full z-modal'>
      <div className={clsx('z-navigation', 'fixed top-0 left-0', 'w-full h-full', 'cc-modal-blur')} />
      <div className={clsx('z-navigation', 'fixed top-0 left-0', 'w-full h-full', 'cc-modal-backdrop')} />
      <motion.div
        ref={ref}
        className={clsx(
          'z-modal',
          'absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2',
          'border shadow-md',
          'clr-app'
        )}
        initial={{ ...animateModal.initial }}
        animate={{ ...animateModal.animate }}
        exit={{ ...animateModal.exit }}
        {...restProps}
      >
        <Overlay position='right-2 top-2'>
          <MiniButton
            noPadding
            titleHtml={prepareTooltip('Закрыть диалоговое окно', 'ESC')}
            icon={<IconClose size='1.25rem' />}
            onClick={handleCancel}
          />
        </Overlay>

        {header ? <h1 className='px-12 py-2 select-none'>{header}</h1> : null}

        <div
          className={clsx('overflow-auto overscroll-contain', className)}
          style={{
            overflow: overflowVisible ? 'visible' : 'auto',
            maxHeight: 'calc(100svh - 8rem)',
            maxWidth: 'calc(100svw - 2rem)'
          }}
        >
          {children}
        </div>

        <div className={clsx('z-modalControls', 'px-6 py-3 flex gap-12 justify-center')}>
          {!readonly ? (
            <Button
              autoFocus
              text={submitText}
              title={!canSubmit ? submitInvalidTooltip : ''}
              className='min-w-[8rem] min-h-[2.6rem]'
              colors='clr-btn-primary'
              disabled={!canSubmit}
              onClick={handleSubmit}
            />
          ) : null}
          <Button
            text={readonly ? 'Закрыть' : 'Отмена'}
            className='min-w-[8rem] min-h-[2.6rem]'
            onClick={handleCancel}
          />
        </div>
      </motion.div>
    </div>
  );
}

export default Modal;
