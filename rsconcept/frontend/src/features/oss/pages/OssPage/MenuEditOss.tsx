import { useAuthSuspense } from '@/features/auth';

import { Button } from '@/components/Control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/Dropdown';
import { IconChild, IconEdit2 } from '@/components/Icons';

import { useMutatingOss } from '../../backend/useMutatingOss';

import { useOssEdit } from './OssEditContext';

export function MenuEditOss() {
  const { isAnonymous } = useAuthSuspense();
  const editMenu = useDropdown();
  const { promptRelocateConstituents, isMutable } = useOssEdit();
  const isProcessing = useMutatingOss();

  function handleRelocate() {
    editMenu.hide();
    promptRelocateConstituents(undefined, []);
  }

  if (isAnonymous) {
    return null;
  }

  return (
    <div ref={editMenu.ref}>
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
      <Dropdown isOpen={editMenu.isOpen}>
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
