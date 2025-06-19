import { useAuthSuspense } from '@/features/auth';

import { MiniButton } from '@/components/control';
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
      <MiniButton
        noHover
        noPadding
        title='Редактирование'
        hideTitle={menu.isOpen}
        className='h-full px-3 text-muted-foreground hover:text-primary cc-animate-color'
        icon={<IconEdit2 size='1.25rem' />}
        onClick={menu.toggle}
      />
      <Dropdown isOpen={menu.isOpen} margin='mt-3'>
        <DropdownButton
          text='Конституенты'
          titleHtml='Перенос конституент</br>между схемами'
          aria-label='Перенос конституент между схемами'
          icon={<IconChild size='1rem' className='icon-green' />}
          disabled={isProcessing || !isMutable}
          onClick={handleRelocate}
        />
      </Dropdown>
    </div>
  );
}
