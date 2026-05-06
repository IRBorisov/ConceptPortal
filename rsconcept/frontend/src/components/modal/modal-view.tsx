'use client';

import { useEffect, useRef } from 'react';
import clsx from 'clsx';

import { useTx } from '@/i18n';

import { BadgeHelp } from '@/features/help/components/badge-help';

import { useEscapeKey } from '@/hooks/use-escape-key';
import { useDialogsStore } from '@/stores/dialogs';
import { prepareTooltip } from '@/utils/format';

import { Button, MiniButton } from '../control';
import { IconClose } from '../icons';
import { cn } from '../utils';

import { ModalBackdrop } from './modal-backdrop';
import { type ModalProps } from './modal-form';
import { useModalPlacement } from './use-modal-placement';

interface ModalViewProps extends ModalProps {
  /** Float all UI elements on top of contents. */
  fullScreen?: boolean;
  noFooterButton?: boolean;
  /** Callback to close the modal. Defaults to the global dialog store. */
  onHide?: () => void;
}

/**
 * Displays a customizable modal window with submit form.
 */
export function ModalView({
  children,
  className,
  header,
  overflowVisible,
  helpTopic,
  hideHelpWhen,
  noFooterButton,
  fullScreen,
  onHide,
  ...restProps
}: React.PropsWithChildren<ModalViewProps>) {
  const tx = useTx();
  const hideDialog = useDialogsStore(state => state.hideDialog);
  const handleHide = onHide ?? hideDialog;
  useEscapeKey(handleHide);
  const { isTopPlaced, setElement } = useModalPlacement<HTMLDivElement>(!fullScreen);

  const previousFocusRef = useRef<HTMLElement | null>(null);
  useEffect(function manageFocus() {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    return function restoreFocus() {
      previousFocusRef.current?.focus();
    };
  }, []);

  return (
    <div className={cn('cc-modal-wrapper', isTopPlaced && 'cc-modal-wrapper-top')}>
      <ModalBackdrop onHide={handleHide} />
      <div
        ref={setElement}
        className='cc-animate-modal relative grid border-2 px-1 pb-1 rounded-xl bg-background'
        role='dialog'
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
          onClick={handleHide}
        />

        {header ? (
          <h1
            className={clsx(
              'px-12 py-2 select-none',
              fullScreen &&
                'z-pop absolute top-0 right-1/2 translate-x-1/2 backdrop-blur-xs bg-background/90 rounded-2xl'
            )}
          >
            {header}
          </h1>
        ) : null}

        <div
          className={cn(
            '@container/modal',
            'max-w-svw xs:max-w-[calc(100svw-2rem)]',
            'overscroll-contain outline-hidden',
            overflowVisible ? 'overflow-visible' : 'overflow-auto',
            fullScreen ? 'max-h-[calc(100svh-2rem)]' : 'max-h-[calc(100svh-8rem)]',
            className
          )}
          {...restProps}
        >
          {children}
        </div>

        {noFooterButton ? null : !fullScreen ? (
          <Button
            text={tx('tx.general.close')}
            aria-label={tx('tx.general.close')}
            className={clsx(
              'my-2 mx-auto text-sm min-w-28',
              fullScreen && 'z-pop absolute bottom-0 right-1/2 translate-x-1/2'
            )}
            onClick={handleHide}
          />
        ) : (
          <div className='z-pop absolute bottom-0 right-1/2 translate-x-1/2 p-3 rounded-xl bg-background/90 backdrop-blur-xs'>
            {' '}
            <Button
              text={tx('tx.general.close')}
              aria-label={tx('tx.general.close')}
              className='text-sm min-w-28'
              onClick={handleHide}
            />
          </div>
        )}
      </div>
    </div>
  );
}
