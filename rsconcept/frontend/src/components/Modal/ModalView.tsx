'use client';

import clsx from 'clsx';

import { BadgeHelp } from '@/features/help';
import useEscapeKey from '@/hooks/useEscapeKey';
import { useDialogsStore } from '@/stores/dialogs';
import { PARAMETER } from '@/utils/constants';
import { prepareTooltip } from '@/utils/utils';

import { Button, MiniButton } from '../Control';
import { IconClose } from '../Icons';
import { ModalBackdrop } from './ModalBackdrop';
import { ModalProps } from './ModalForm';

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
    <div className='fixed top-0 left-0 w-full h-full z-modal cursor-default'>
      <ModalBackdrop onHide={hideDialog} />
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
          onClick={hideDialog}
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
          <Button text='Закрыть' className='min-w-[7rem]' onClick={hideDialog} />
        </div>
      </div>
    </div>
  );
}
