'use client';

import type { SubmitEvent, SubmitEventHandler } from 'react';
import { useEffect, useRef } from 'react';
import clsx from 'clsx';

import { useTx } from '@/i18n';

import { type HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';

import { useEscapeKey } from '@/hooks/use-escape-key';
import { useValueTooltipAnchor } from '@/hooks/use-value-tooltip-anchor';
import { useDialogsStore } from '@/stores/dialogs';
import { prepareTooltip } from '@/utils/format';

import { Button, MiniButton, SubmitButton } from '../control';
import { IconAlert, IconClose } from '../icons';
import { type Styling } from '../props';
import { cn } from '../utils';

import { ModalBackdrop } from './modal-backdrop';
import { useModalPlacement } from './use-modal-placement';

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
  onSubmit: SubmitEventHandler<HTMLFormElement>;

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
  submitText,
  validationHint,
  beforeSubmit,
  onSubmit,
  onCancel,

  helpTopic,
  hideHelpWhen,
  ...restProps
}: React.PropsWithChildren<ModalFormProps>) {
  const tx = useTx();
  const hideDialog = useDialogsStore(state => state.hideDialog);
  const validationTooltip = useValueTooltipAnchor(validationHint ?? null);
  const resolvedSubmitText = submitText ?? tx('tx.general.continue');
  const { isTopPlaced, setElement } = useModalPlacement<HTMLFormElement>();

  const previousFocusRef = useRef<HTMLElement | null>(null);
  useEffect(function manageFocus() {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    return function restoreFocus() {
      previousFocusRef.current?.focus();
    };
  }, []);

  function handleCancel() {
    onCancel?.();
    hideDialog();
  }
  useEscapeKey(handleCancel);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    if (beforeSubmit && !beforeSubmit()) {
      return;
    }
    onSubmit(event);
    hideDialog();
  }

  return (
    <div className={cn('cc-modal-wrapper', isTopPlaced && 'cc-modal-wrapper-top')}>
      <ModalBackdrop onHide={handleCancel} />
      <form
        ref={setElement}
        className='cc-animate-modal relative grid border-2 px-1 pb-1 rounded-xl bg-background'
        role='dialog'
        onSubmit={handleSubmit}
        aria-labelledby='modal-title'
      >
        {helpTopic && !hideHelpWhen?.() ? (
          <BadgeHelp topic={helpTopic} className='absolute z-pop top-1 left-1' contentClass='sm:max-w-160' />
        ) : null}

        <MiniButton
          title={prepareTooltip(tx('tx.shell.modal.close.hint'), 'ESC')}
          aria-label={tx('tx.general.close')}
          noPadding
          icon={<IconClose size='1.25rem' />}
          className='absolute z-pop top-2 right-2'
          onClick={handleCancel}
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

        <div className={clsx('z-pop relative', 'my-2', 'flex justify-center', 'text-sm', !validationHint && 'gap-12')}>
          <SubmitButton autoFocus text={resolvedSubmitText} className='min-w-28' disabled={!canSubmit} />
          {validationHint ? (
            <div
              className={clsx(
                'pt-0.5 w-12',
                'text-muted-foreground cc-animate-color duration-fade',
                canSubmit ? 'hover:text-constructive' : 'hover:text-destructive'
              )}
              {...validationTooltip}
            >
              <IconAlert size='1.5rem' className='mx-auto' />
            </div>
          ) : null}
          <Button
            text={tx('tx.general.cancel')}
            aria-label={tx('tx.general.close')}
            className='min-w-28'
            onClick={handleCancel}
          />
        </div>
      </form>
    </div>
  );
}
