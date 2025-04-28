'use client';

import { DropdownButton } from '@/components/dropdown';
import { IconDestroy, IconEdit2 } from '@/components/icons';
import { useDialogsStore } from '@/stores/dialogs';

import { useDeleteBlock } from '../../../../backend/use-delete-block';
import { useMutatingOss } from '../../../../backend/use-mutating-oss';
import { type IBlock } from '../../../../models/oss';
import { LayoutManager } from '../../../../models/oss-layout-api';
import { useOssEdit } from '../../oss-edit-context';
import { useGetLayout } from '../use-get-layout';

interface MenuBlockProps {
  block: IBlock;
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
      manager: new LayoutManager(schema, getLayout()),
      target: block
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
        icon={<IconEdit2 size='1rem' className='icon-primary' />}
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
