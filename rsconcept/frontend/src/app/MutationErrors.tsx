import clsx from 'clsx';

import { useMutationErrors } from '@/backend/useMutationErrors';
import { Button } from '@/components/Control';
import { DescribeError } from '@/components/InfoError';
import useEscapeKey from '@/hooks/useEscapeKey';
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
    <div className='fixed top-0 left-0 w-full h-full z-modal cursor-default'>
      <div className={clsx('z-navigation', 'fixed top-0 left-0', 'w-full h-full', 'backdrop-blur-[3px] opacity-50')} />
      <div className={clsx('z-navigation', 'fixed top-0 left-0', 'w-full h-full', 'bg-prim-0 opacity-25')} />
      <div
        className={clsx(
          'px-10 mb-10 py-3 flex flex-col items-center',
          'z-modal absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2',
          'border rounded-xl bg-prim-100'
        )}
      >
        <h1 className='py-2 select-none'>Ошибка при обработке</h1>
        <div className={clsx('px-3 flex flex-col', 'text-warn-600 text-sm font-semibold', 'select-text')}>
          <DescribeError error={mutationErrors[0]} />
        </div>
        <Button onClick={resetErrors} className='w-fit' text='Закрыть' />
      </div>
    </div>
  );
}
