'use client';

import { DropdownButton } from '@/components/dropdown';
import { IconDestroy, IconEdit } from '@/components/icons';
import { useDialogsStore } from '@/stores/dialogs';

import { useDeleteBlock } from '../../../../backend/use-delete-block';
import { useMutatingOss } from '../../../../backend/use-mutating-oss';
import { type Block } from '../../../../models/oss';
import { useOssEdit } from '../../oss-edit-context';
import { useGetLayout } from '../use-get-layout';

interface MenuBlockProps {
  block: Block;
  onHide: () => void;
}

export function MenuBlock({ block, onHide }: MenuBlockProps) {
  const { schema, isMutable } = useOssEdit();
  const isProcessing = useMutatingOss();
  const getLayout = useGetLayout();

  const showEditBlock = useDialogsStore(state => state.showEditBlock);
  const { deleteBlock } = useDeleteBlock();

  function handleEditBlock() {
    if (!block) {
      return;
    }
    onHide();
    showEditBlock({
      layout: getLayout(),
      ossID: schema.id,
      targetID: block.id
    });
  }

  function handleDeleteBlock() {
    onHide();
    void deleteBlock({ itemID: schema.id, data: { target: block.id, layout: getLayout() } });
  }

  return (
    <>
      <DropdownButton
        text='Редактировать'
        title='Редактировать блок'
        icon={<IconEdit size='1rem' className='icon-primary' />}
        onClick={handleEditBlock}
        disabled={!isMutable || isProcessing}
      />
      <DropdownButton
        text='Удалить блок'
        icon={<IconDestroy size='1rem' className='icon-red' />}
        onClick={handleDeleteBlock}
        disabled={!isMutable || isProcessing}
      />
    </>
  );
}
