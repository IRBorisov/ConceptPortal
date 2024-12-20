'use client';

import clsx from 'clsx';

import useEscapeKey from '@/hooks/useEscapeKey';
import { HelpTopic } from '@/models/miscellaneous';
import { PARAMETER } from '@/utils/constants';
import { prepareTooltip } from '@/utils/labels';

import { IconClose } from '../Icons';
import BadgeHelp from '../info/BadgeHelp';
import { CProps } from '../props';
import Button from './Button';
import MiniButton from './MiniButton';

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
      <div className={clsx('z-navigation', 'fixed top-0 left-0', 'w-full h-full', 'backdrop-blur-[3px] opacity-50')} />
      <div
        className={clsx('z-navigation', 'fixed top-0 left-0', 'w-full h-full', 'bg-prim-0 opacity-25')}
        onClick={hideWindow}
      />
      <div
        className={clsx(
          'cc-animate-modal',
          'z-modal absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2',
          'border rounded-xl bg-prim-100'
        )}
      >
        {helpTopic && !hideHelpWhen?.() ? (
          <div className='float-left mt-2 ml-2'>
            <BadgeHelp topic={helpTopic} className={clsx(PARAMETER.TOOLTIP_WIDTH, 'sm:max-w-[40rem]')} padding='p-0' />
          </div>
        ) : null}

        <MiniButton
          noPadding
          titleHtml={prepareTooltip('Закрыть диалоговое окно', 'ESC')}
          icon={<IconClose size='1.25rem' />}
          className='float-right mt-2 mr-2'
          onClick={handleCancel}
        />

        {header ? <h1 className='px-12 py-2 select-none'>{header}</h1> : null}

        <div
          className={clsx(
            'overscroll-contain max-h-[calc(100svh-8rem)] max-w-[100svw] xs:max-w-[calc(100svw-2rem)] outline-none',
            {
              'overflow-auto': !overflowVisible,
              'overflow-visible': overflowVisible
            },
            className
          )}
          {...restProps}
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
      </div>
    </div>
  );
}

export default Modal;
