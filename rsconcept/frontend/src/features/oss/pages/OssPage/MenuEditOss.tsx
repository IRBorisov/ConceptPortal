import { useAuthSuspense } from '@/features/auth';

import { Button } from '@/components/Control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/Dropdown';
import { IconChild, IconEdit2 } from '@/components/Icons';
import { useDialogsStore } from '@/stores/dialogs';

import { useMutatingOss } from '../../backend/useMutatingOss';

import { useOssEdit } from './OssEditContext';

export function MenuEditOss() {
  const { isAnonymous } = useAuthSuspense();
  const editMenu = useDropdown();
  const { schema, isMutable } = useOssEdit();
  const isProcessing = useMutatingOss();

  const showRelocateConstituents = useDialogsStore(state => state.showRelocateConstituents);

  function handleRelocate() {
    editMenu.hide();
    showRelocateConstituents({
      oss: schema,
      initialTarget: undefined,
      positions: []
    });
  }

  if (isAnonymous) {
    return null;
  }

  return (
    <div ref={editMenu.ref} className='relative'>
      <Button
        dense
        noBorder
        noOutline
        tabIndex={-1}
        title='Редактирование'
        hideTitle={editMenu.isOpen}
        className='h-full px-2'
        icon={<IconEdit2 size='1.25rem' className={isMutable ? 'icon-green' : 'icon-red'} />}
        onClick={editMenu.toggle}
      />
      <Dropdown isOpen={editMenu.isOpen} margin='mt-3'>
        <DropdownButton
          text='Конституенты'
          titleHtml='Перенос конституент</br>между схемами'
          icon={<IconChild size='1rem' className='icon-green' />}
          disabled={isProcessing}
          onClick={handleRelocate}
        />
      </Dropdown>
    </div>
  );
}
