import { useAuthSuspense } from '@/features/auth';

import { Button } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { IconChild, IconEdit2 } from '@/components/icons';
import { useDialogsStore } from '@/stores/dialogs';

import { useMutatingOss } from '../../backend/use-mutating-oss';

import { useOssEdit } from './oss-edit-context';

export function MenuEditOss() {
  const { isAnonymous } = useAuthSuspense();
  const menu = useDropdown();
  const { schema, isMutable } = useOssEdit();
  const isProcessing = useMutatingOss();

  const showRelocateConstituents = useDialogsStore(state => state.showRelocateConstituents);

  function handleRelocate() {
    menu.hide();
    showRelocateConstituents({
      oss: schema,
      initialTarget: undefined
    });
  }

  if (isAnonymous) {
    return null;
  }

  return (
    <div ref={menu.ref} onBlur={menu.handleBlur} className='relative'>
      <Button
        dense
        noBorder
        noOutline
        tabIndex={-1}
        title='Редактирование'
        hideTitle={menu.isOpen}
        className='h-full px-2'
        icon={<IconEdit2 size='1.25rem' className={isMutable ? 'icon-green' : 'icon-red'} />}
        onClick={menu.toggle}
      />
      <Dropdown isOpen={menu.isOpen} margin='mt-3'>
        <DropdownButton
          text='Конституенты'
          titleHtml='Перенос конституент</br>между схемами'
          aria-label='Перенос конституент между схемами'
          icon={<IconChild size='1rem' className='icon-green' />}
          disabled={isProcessing}
          onClick={handleRelocate}
        />
      </Dropdown>
    </div>
  );
}
