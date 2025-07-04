'use client';

import clsx from 'clsx';

import { BadgeHelp } from '@/features/help/components/badge-help';

import { useEscapeKey } from '@/hooks/use-escape-key';
import { useDialogsStore } from '@/stores/dialogs';
import { prepareTooltip } from '@/utils/utils';

import { Button, MiniButton } from '../control';
import { IconClose } from '../icons';
import { cn } from '../utils';

import { ModalBackdrop } from './modal-backdrop';
import { type ModalProps } from './modal-form';

interface ModalViewProps extends ModalProps {
  /** Float all UI elements on top of contents. */
  fullScreen?: boolean;
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
  fullScreen,
  ...restProps
}: React.PropsWithChildren<ModalViewProps>) {
  const hideDialog = useDialogsStore(state => state.hideDialog);
  useEscapeKey(hideDialog);

  return (
    <div className='cc-modal-wrapper'>
      <ModalBackdrop onHide={hideDialog} />
      <div className='cc-animate-modal relative grid border-2 px-1 pb-1 rounded-xl bg-background' role='dialog'>
        {helpTopic && !hideHelpWhen?.() ? (
          <BadgeHelp
            topic={helpTopic}
            className='absolute z-pop top-2 left-2'
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
            'max-w-[100svw] xs:max-w-[calc(100svw-2rem)]',
            'overscroll-contain outline-hidden',
            overflowVisible ? 'overflow-visible' : 'overflow-auto',
            fullScreen ? 'max-h-[calc(100svh-2rem)]' : 'max-h-[calc(100svh-8rem)]',
            className
          )}
          {...restProps}
        >
          {children}
        </div>

        {!fullScreen ? (
          <Button
            text='Закрыть'
            aria-label='Закрыть'
            className={clsx(
              'my-2 mx-auto text-sm min-w-28',
              fullScreen && 'z-pop absolute bottom-0 right-1/2 translate-x-1/2'
            )}
            onClick={hideDialog}
          />
        ) : (
          <div className='z-pop absolute bottom-0 right-1/2 translate-x-1/2 p-3 rounded-xl bg-background/90 backdrop-blur-xs'>
            {' '}
            <Button text='Закрыть' aria-label='Закрыть' className='text-sm min-w-28' onClick={hideDialog} />
          </div>
        )}
      </div>
    </div>
  );
}
