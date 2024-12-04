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
  /** Title of the modal window. */
  header?: string;

  /** Text of the submit button. */
  submitText?: string;

  /** Tooltip for the submit button when the form is invalid. */
  submitInvalidTooltip?: string;

  /** Indicates that form is readonly. */
  readonly?: boolean;

  /** Indicates that submit button is enabled. */
  canSubmit?: boolean;

  /** Indicates that the modal window should be scrollable. */
  overflowVisible?: boolean;

  /** Callback to be called when the modal window is closed. */
  hideWindow: () => void;

  /** Callback to be called before submit. */
  beforeSubmit?: () => boolean;

  /** Callback to be called after submit. */
  onSubmit?: () => void;

  /** Callback to be called after cancel. */
  onCancel?: () => void;

  /** Help topic to be displayed in the modal window. */
  helpTopic?: HelpTopic;

  /** Callback to determine if help should be displayed. */
  hideHelpWhen?: () => boolean;
}

/**
 * Displays a customizable modal window.
 */
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
    onCancel?.();
  };

  const handleSubmit = () => {
    if (beforeSubmit && !beforeSubmit()) {
      return;
    }
    onSubmit?.();
    hideWindow();
  };

  return (
    <div className='fixed top-0 left-0 w-full h-full z-modal cursor-default'>
      <div className={clsx('z-navigation', 'fixed top-0 left-0', 'w-full h-full', 'cc-modal-blur')} />
      <div
        className={clsx('z-navigation', 'fixed top-0 left-0', 'w-full h-full', 'cc-modal-backdrop')}
        onClick={hideWindow}
      />
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
