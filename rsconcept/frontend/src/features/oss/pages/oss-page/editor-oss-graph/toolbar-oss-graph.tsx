'use client';

import React from 'react';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { type OssNode } from '@/features/oss/models/oss-layout';

import { MiniButton } from '@/components/control';
import {
  IconConceptBlock,
  IconDestroy,
  IconEdit2,
  IconFitImage,
  IconNewItem,
  IconReset,
  IconSave,
  IconSettings
} from '@/components/icons';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { useDialogsStore } from '@/stores/dialogs';
import { isIOS, prepareTooltip } from '@/utils/utils';

import { useMutatingOss } from '../../../backend/use-mutating-oss';
import { useUpdateLayout } from '../../../backend/use-update-layout';
import { NodeType } from '../../../models/oss';
import { useOssEdit } from '../oss-edit-context';

import { useOssFlow } from './oss-flow-context';
import { useGetLayout } from './use-get-layout';

interface ToolbarOssGraphProps extends Styling {
  onCreateOperation: () => void;
  onCreateBlock: () => void;
  onDelete: () => void;
  onResetPositions: () => void;

  isContextMenuOpen: boolean;
  openContextMenu: (node: OssNode, clientX: number, clientY: number) => void;
  hideContextMenu: () => void;
}

export function ToolbarOssGraph({
  onCreateOperation,
  onCreateBlock,
  onDelete,
  onResetPositions,

  isContextMenuOpen,
  openContextMenu,
  hideContextMenu,
  className,
  ...restProps
}: ToolbarOssGraphProps) {
  const { schema, selectedItems, isMutable, canDeleteOperation: canDelete } = useOssEdit();
  const isProcessing = useMutatingOss();
  const { resetView, nodes } = useOssFlow();
  const selectedOperation =
    selectedItems.length === 1 && selectedItems[0].nodeType === NodeType.OPERATION ? selectedItems[0] : null;
  const selectedBlock =
    selectedItems.length === 1 && selectedItems[0].nodeType === NodeType.BLOCK ? selectedItems[0] : null;
  const getLayout = useGetLayout();

  const { updateLayout } = useUpdateLayout();

  const showOssOptions = useDialogsStore(state => state.showOssOptions);

  function handleShowOptions() {
    showOssOptions();
  }

  function handleSavePositions() {
    void updateLayout({ itemID: schema.id, data: getLayout() });
  }

  function handleEditItem(event: React.MouseEvent<HTMLButtonElement>) {
    if (isContextMenuOpen) {
      hideContextMenu();
      return;
    }
    const nodeID = selectedOperation?.nodeID ?? selectedBlock?.nodeID;
    if (!nodeID) {
      return;
    }
    const node = nodes.find(node => node.id === nodeID);
    if (node) {
      openContextMenu(node, event.clientX, event.clientY);
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center pt-1',
        'rounded-b-2xl',
        'hover:bg-background backdrop-blur-xs',
        className
      )}
      {...restProps}
    >
      <div className='cc-icons'>
        <MiniButton
          title='Сбросить изменения'
          icon={<IconReset size='1.25rem' className='icon-primary' />}
          onClick={onResetPositions}
        />
        <MiniButton
          title='Сбросить вид'
          icon={<IconFitImage size='1.25rem' className='icon-primary' />}
          onClick={resetView}
        />
        <MiniButton
          title='Настройки отображения'
          icon={<IconSettings size='1.25rem' className='icon-primary' />}
          onClick={handleShowOptions}
        />
        <BadgeHelp topic={HelpTopic.UI_OSS_GRAPH} contentClass='sm:max-w-160' offset={4} />
      </div>
      {isMutable ? (
        <div className='cc-icons'>
          <MiniButton
            titleHtml={prepareTooltip('Сохранить изменения', 'Ctrl + S')}
            aria-label='Сохранить изменения'
            icon={<IconSave size='1.25rem' className='icon-primary' />}
            onClick={handleSavePositions}
            disabled={isProcessing}
          />
          <MiniButton
            titleHtml={prepareTooltip('Редактировать выбранную', isIOS() ? '' : 'Правый клик')}
            hideTitle={isContextMenuOpen}
            aria-label='Редактировать выбранную'
            icon={<IconEdit2 size='1.25rem' className='icon-primary' />}
            onClick={handleEditItem}
            disabled={selectedItems.length !== 1 || isProcessing}
          />
          <MiniButton
            titleHtml={prepareTooltip('Новая операция', 'Ctrl + Q')}
            aria-label='Новая операция'
            icon={<IconNewItem size='1.25rem' className='icon-green' />}
            onClick={onCreateOperation}
            disabled={isProcessing}
          />
          <MiniButton
            titleHtml={prepareTooltip('Новый блок', 'Ctrl + Shift + Q')}
            aria-label='Новый блок'
            icon={<IconConceptBlock size='1.25rem' className='icon-green' />}
            onClick={onCreateBlock}
            disabled={isProcessing}
          />

          <MiniButton
            titleHtml={prepareTooltip('Удалить выбранную', 'Delete')}
            aria-label='Удалить выбранную'
            icon={<IconDestroy size='1.25rem' className='icon-red' />}
            onClick={onDelete}
            disabled={
              isProcessing ||
              (!selectedOperation && !selectedBlock) ||
              (!!selectedOperation && !canDelete(selectedOperation))
            }
          />
        </div>
      ) : null}
    </div>
  );
}
