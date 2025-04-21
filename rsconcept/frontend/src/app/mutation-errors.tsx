import clsx from 'clsx';

import { useMutationErrors } from '@/backend/use-mutation-errors';
import { Button } from '@/components/control';
import { DescribeError } from '@/components/info-error';
import { ModalBackdrop } from '@/components/modal/modal-backdrop';
import { useEscapeKey } from '@/hooks/use-escape-key';
import { useDialogsStore } from '@/stores/dialogs';

export function MutationErrors() {
  const { mutationErrors, resetErrors } = useMutationErrors();
  const hideDialog = useDialogsStore(state => state.hideDialog);

  useEscapeKey(resetErrors, mutationErrors.length > 0);

  if (mutationErrors.length === 0) {
    return null;
  }

  hideDialog();

  return (
    <div className='cc-modal-wrapper'>
      <ModalBackdrop onHide={resetErrors} />
      <div
        className={clsx(
          'z-pop', //
          'flex flex-col px-10 py-3 items-center',
          'border rounded-xl bg-background'
        )}
        role='alertdialog'
      >
        <h1 className='py-2 select-none'>Ошибка при обработке</h1>
        <div
          className={clsx(
            'max-h-[calc(100svh-8rem)] max-w-[calc(100svw-2rem)]',
            'px-3 flex flex-col',
            'text-destructive text-sm font-semibold select-text',
            'overflow-auto'
          )}
        >
          <DescribeError error={mutationErrors[0]} />
        </div>
        <Button onClick={resetErrors} className='w-fit' text='Закрыть' />
      </div>
    </div>
  );
}
