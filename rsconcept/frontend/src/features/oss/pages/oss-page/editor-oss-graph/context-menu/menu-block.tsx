'use client';

import { useDeleteBlock } from '@/features/oss/backend/use-delete-block';

import { DropdownButton } from '@/components/dropdown';
import { IconDestroy, IconEdit2 } from '@/components/icons';
import { useDialogsStore } from '@/stores/dialogs';

import { useMutatingOss } from '../../../../backend/use-mutating-oss';
import { type IBlock } from '../../../../models/oss';
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

  function handleEditOperation() {
    if (!block) {
      return;
    }
    onHide();
    showEditBlock({
      oss: schema,
      target: block,
      layout: getLayout()
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
        onClick={handleEditOperation}
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
