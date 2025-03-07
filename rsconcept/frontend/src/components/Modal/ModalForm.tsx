'use client';

import clsx from 'clsx';

import { type HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components';

import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useDialogsStore } from '@/stores/dialogs';
import { prepareTooltip } from '@/utils/utils';

import { Button, MiniButton, SubmitButton } from '../Control';
import { IconClose } from '../Icons';
import { type Styling } from '../props';

import { ModalBackdrop } from './ModalBackdrop';

export interface ModalProps extends Styling {
  /** Title of the modal window. */
  header?: string;

  /** Indicates that the modal window should be scrollable. */
  overflowVisible?: boolean;

  /** Help topic to be displayed in the modal window. */
  helpTopic?: HelpTopic;

  /** Callback to determine if help should be displayed. */
  hideHelpWhen?: () => boolean;
}

interface ModalFormProps extends ModalProps {
  /** Text of the submit button. */
  submitText?: string;

  /** Tooltip for the submit button when the form is invalid. */
  submitInvalidTooltip?: string;

  /** Indicates that submit button is enabled. */
  canSubmit?: boolean;

  /** Callback to be called before submit. */
  beforeSubmit?: () => boolean;

  /** Callback to be called after submit. */
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;

  /** Callback to be called when modal is canceled. */
  onCancel?: () => void;
}

/**
 * Displays a customizable modal window with submit form.
 */
export function ModalForm({
  children,

  className,
  header,
  overflowVisible,

  canSubmit = true,
  submitText = 'Продолжить',
  submitInvalidTooltip,
  beforeSubmit,
  onSubmit,
  onCancel,

  helpTopic,
  hideHelpWhen,
  ...restProps
}: React.PropsWithChildren<ModalFormProps>) {
  const hideDialog = useDialogsStore(state => state.hideDialog);

  function handleCancel() {
    onCancel?.();
    hideDialog();
  }
  useEscapeKey(handleCancel);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (beforeSubmit && !beforeSubmit()) {
      return;
    }
    onSubmit(event);
    hideDialog();
  }

  return (
    <div className='fixed top-0 left-0 w-full h-full z-modal isolate cursor-default'>
      <ModalBackdrop onHide={handleCancel} />
      <form
        className={clsx(
          'cc-animate-modal',
          'absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2',
          'border rounded-xl bg-prim-100'
        )}
        onSubmit={handleSubmit}
      >
        {helpTopic && !hideHelpWhen?.() ? (
          <BadgeHelp
            topic={helpTopic} //
            className='float-left mt-2 ml-2'
            padding='p-0'
            contentClass='sm:max-w-[40rem]'
          />
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
            '@container/modal',
            'max-h-[calc(100svh-8rem)] max-w-[100svw] xs:max-w-[calc(100svw-2rem)]',
            'overscroll-contain outline-hidden',
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

        <div className='z-pop my-2 flex gap-12 justify-center text-sm'>
          <SubmitButton
            autoFocus
            text={submitText}
            title={!canSubmit ? submitInvalidTooltip : ''}
            className='min-w-[7rem]'
            disabled={!canSubmit}
          />
          <Button text='Отмена' className='min-w-[7rem]' onClick={handleCancel} />
        </div>
      </form>
    </div>
  );
}
