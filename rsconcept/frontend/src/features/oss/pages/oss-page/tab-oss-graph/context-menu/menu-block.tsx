'use client';

import { useTx } from '@/i18n';
import { type Block } from '@rsconcept/domain/library';

import { DropdownButton } from '@/components/dropdown';
import { IconDestroy, IconEdit } from '@/components/icons';

import { useDeleteBlock } from '../../../../backend/use-delete-block';
import { useMutatingOss } from '../../../../backend/use-mutating-oss';
import { useOssDialogsStore } from '../../../../dialogs/oss-dialog-store';
import { useOssEdit } from '../../oss-edit-context';
import { useGetLayout } from '../use-get-layout';

interface MenuBlockProps {
  block: Block;
  onHide: () => void;
}

export function MenuBlock({ block, onHide }: MenuBlockProps) {
  const tx = useTx();
  const { schema, isMutable } = useOssEdit();
  const isProcessing = useMutatingOss();
  const getLayout = useGetLayout();

  const showEditBlock = useOssDialogsStore(state => state.showEditBlock);
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
        text={tx('tx.general.edit')}
        title={tx('tx.oss.block.edit')}
        icon={<IconEdit size='1rem' className='icon-primary' />}
        onClick={handleEditBlock}
        disabled={!isMutable || isProcessing}
      />
      <DropdownButton
        text={tx('tx.oss.block.delete')}
        icon={<IconDestroy size='1rem' className='icon-red' />}
        onClick={handleDeleteBlock}
        disabled={!isMutable || isProcessing}
      />
    </>
  );
}
