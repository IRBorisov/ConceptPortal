'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useRef } from 'react';

import useEscapeKey from '@/hooks/useEscapeKey';
import { HelpTopic } from '@/models/miscellaneous';
import { animateModal } from '@/styling/animations';
import { PARAMETER } from '@/utils/constants';
import { prepareTooltip } from '@/utils/labels';

import { IconClose } from '../Icons';
import BadgeHelp from '../info/BadgeHelp';
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
  beforeSubmit?: () => boolean;
  onSubmit?: () => void;
  onCancel?: () => void;

  helpTopic?: HelpTopic;
  hideHelpWhen?: () => boolean;
}

function Modal({
  children,

  header,
  submitText = 'Продолжить',
  submitInvalidTooltip,

  readonly,
  canSubmit,
  overflowVisible,

  hideWindow,
  beforeSubmit,
  onSubmit,
  onCancel,
  className,

  helpTopic,
  hideHelpWhen,
  ...restProps
}: React.PropsWithChildren<ModalProps>) {
  const ref = useRef(null);
  useEscapeKey(hideWindow);

  const handleCancel = () => {
    hideWindow();
    if (onCancel) onCancel();
  };

  const handleSubmit = () => {
    if (beforeSubmit && !beforeSubmit()) {
      return;
    }
    if (onSubmit) onSubmit();
    hideWindow();
  };

  return (
    <div className='fixed top-0 left-0 w-full h-full z-modal cursor-default'>
      <div className={clsx('z-navigation', 'fixed top-0 left-0', 'w-full h-full', 'cc-modal-blur')} />
      <div className={clsx('z-navigation', 'fixed top-0 left-0', 'w-full h-full', 'cc-modal-backdrop')} />
      <motion.div
        ref={ref}
        className={clsx(
          'z-modal',
          'absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2',
          'border rounded-xl',
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
        {helpTopic && !hideHelpWhen?.() ? (
          <Overlay position='left-2 top-2'>
            <BadgeHelp topic={helpTopic} className={clsx(PARAMETER.TOOLTIP_WIDTH, 'sm:max-w-[40rem]')} padding='p-0' />
          </Overlay>
        ) : null}

        {header ? <h1 className='px-12 py-2 select-none'>{header}</h1> : null}

        <div
          className={clsx(
            'overscroll-contain max-h-[calc(100svh-8rem)] max-w-[100svw] xs:max-w-[calc(100svw-2rem)]',
            {
              'overflow-auto': !overflowVisible,
              'overflow-visible': overflowVisible
            },
            className
          )}
        >
          {children}
        </div>

        <div className='z-modalControls my-2 flex gap-12 justify-center text-sm'>
          {!readonly ? (
            <Button
              autoFocus
              text={submitText}
              title={!canSubmit ? submitInvalidTooltip : ''}
              className='min-w-[7rem]'
              colors='clr-btn-primary'
              disabled={!canSubmit}
              onClick={handleSubmit}
            />
          ) : null}
          <Button text={readonly ? 'Закрыть' : 'Отмена'} className='min-w-[7rem]' onClick={handleCancel} />
        </div>
      </motion.div>
    </div>
  );
}

export default Modal;
