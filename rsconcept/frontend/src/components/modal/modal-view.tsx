'use client';

import clsx from 'clsx';

import { BadgeHelp } from '@/features/help/components';

import { useEscapeKey } from '@/hooks/use-escape-key';
import { useDialogsStore } from '@/stores/dialogs';
import { prepareTooltip } from '@/utils/utils';

import { Button, MiniButton } from '../control';
import { IconClose } from '../icons';

import { ModalBackdrop } from './modal-backdrop';
import { type ModalProps } from './modal-form';

interface ModalViewProps extends ModalProps {}

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
  ...restProps
}: React.PropsWithChildren<ModalViewProps>) {
  const hideDialog = useDialogsStore(state => state.hideDialog);
  useEscapeKey(hideDialog);

  return (
    <div className='cc-modal-wrapper'>
      <ModalBackdrop onHide={hideDialog} />
      <div className='cc-animate-modal relative grid border rounded-xl bg-prim-100' role='dialog'>
        {helpTopic && !hideHelpWhen?.() ? (
          <BadgeHelp
            topic={helpTopic}
            className='absolute z-pop top-2 left-2'
            padding='p-0'
            contentClass='sm:max-w-160'
          />
        ) : null}

        <MiniButton
          noPadding
          aria-label='Закрыть'
          titleHtml={prepareTooltip('Закрыть диалоговое окно', 'ESC')}
          icon={<IconClose size='1.25rem' />}
          className='absolute z-pop top-2 right-2'
          onClick={hideDialog}
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

        <Button
          text='Закрыть'
          aria-label='Закрыть'
          className='z-pop my-2 mx-auto text-sm min-w-28'
          onClick={hideDialog}
        />
      </div>
    </div>
  );
}
