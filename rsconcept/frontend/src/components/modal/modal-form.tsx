'use client';

import { type HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';

import { useEscapeKey } from '@/hooks/use-escape-key';
import { useDialogsStore } from '@/stores/dialogs';
import { globalIDs } from '@/utils/constants';
import { prepareTooltip } from '@/utils/utils';

import { Button, MiniButton, SubmitButton } from '../control';
import { IconAlert, IconClose } from '../icons';
import { type Styling } from '../props';
import { cn } from '../utils';

import { ModalBackdrop } from './modal-backdrop';

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
  validationHint?: string;

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
  validationHint,
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
    <div className='cc-modal-wrapper'>
      <ModalBackdrop onHide={handleCancel} />
      <form
        className='cc-animate-modal relative grid border-2 px-1 pb-1 rounded-xl bg-background'
        role='dialog'
        onSubmit={handleSubmit}
        aria-labelledby='modal-title'
      >
        {helpTopic && !hideHelpWhen?.() ? (
          <BadgeHelp
            topic={helpTopic}
            className='absolute z-top top-2 left-2'
            padding='p-0'
            contentClass='sm:max-w-160'
          />
        ) : null}

        <MiniButton
          titleHtml={prepareTooltip('Закрыть диалоговое окно', 'ESC')}
          aria-label='Закрыть'
          noPadding
          icon={<IconClose size='1.25rem' />}
          className='absolute z-pop top-2 right-2'
          onClick={hideDialog}
        />

        {header ? (
          <h1 id='modal-title' className='px-12 py-2 select-none'>
            {header}
          </h1>
        ) : null}

        <div
          className={cn(
            '@container/modal',
            'max-h-[calc(100svh-8rem)] max-w-svw xs:max-w-[calc(100svw-2rem)]',
            'overscroll-contain outline-hidden',
            overflowVisible ? 'overflow-visible' : 'overflow-auto',
            className
          )}
          {...restProps}
        >
          {children}
        </div>

        <div className='z-pop my-2 flex gap-12 justify-center text-sm relative'>
          {validationHint ? (
            <div className='absolute top-0.5 text-muted-foreground'>
              <IconAlert
                size='1.5rem'
                className={canSubmit ? 'hover:icon-green' : 'hover:icon-red'}
                data-tooltip-id={globalIDs.tooltip}
                data-tooltip-html={validationHint}
              />
            </div>
          ) : null}
          <SubmitButton autoFocus text={submitText} className='min-w-28' disabled={!canSubmit} />
          <Button text='Отмена' aria-label='Закрыть' className='min-w-28' onClick={handleCancel} />
        </div>
      </form>
    </div>
  );
}
