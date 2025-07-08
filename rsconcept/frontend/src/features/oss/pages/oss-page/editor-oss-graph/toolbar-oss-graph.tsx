'use client';

import React from 'react';

import { useAuthSuspense } from '@/features/auth/backend/use-auth';
import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { IconShowSidebar } from '@/features/library/components/icon-show-sidebar';
import { type OssNode } from '@/features/oss/models/oss-layout';

import { MiniButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import {
  IconClustering,
  IconConceptBlock,
  IconDestroy,
  IconDownload,
  IconEdit2,
  IconFilter,
  IconFitImage,
  IconNewItem,
  IconReset,
  IconSave,
  IconSettings
} from '@/components/icons';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { useDialogsStore } from '@/stores/dialogs';
import { usePreferencesStore } from '@/stores/preferences';
import { isIOS, isMac, notImplemented, prepareTooltip } from '@/utils/utils';

import { useMutatingOss } from '../../../backend/use-mutating-oss';
import { useUpdateLayout } from '../../../backend/use-update-layout';
import { NodeType } from '../../../models/oss';
import { useOssEdit } from '../oss-edit-context';

import { useOssFlow } from './oss-flow-context';
import { useGetLayout } from './use-get-layout';

interface ToolbarOssGraphProps extends Styling {
  onCreateBlock: () => void;
  onCreateSchema: () => void;
  onImportSchema: () => void;
  onCreateSynthesis: () => void;
  onDelete: () => void;
  onResetPositions: () => void;

  isContextMenuOpen: boolean;
  openContextMenu: (node: OssNode, clientX: number, clientY: number) => void;
  hideContextMenu: () => void;
}

export function ToolbarOssGraph({
  onCreateBlock,
  onCreateSchema,
  onImportSchema,
  onCreateSynthesis,
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
  const getLayout = useGetLayout();
  const { updateLayout } = useUpdateLayout();
  const { user } = useAuthSuspense();
  const menu = useDropdown();

  const showOptions = useDialogsStore(state => state.showOssOptions);
  const showSidePanel = usePreferencesStore(state => state.showOssSidePanel);
  const toggleShowSidePanel = usePreferencesStore(state => state.toggleShowOssSidePanel);

  const selectedOperation =
    selectedItems.length === 1 && selectedItems[0].nodeType === NodeType.OPERATION ? selectedItems[0] : null;
  const selectedBlock =
    selectedItems.length === 1 && selectedItems[0].nodeType === NodeType.BLOCK ? selectedItems[0] : null;

  function handleMenuToggle() {
    hideContextMenu();
    menu.toggle();
  }

  function handleShowOptions() {
    showOptions();
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
          title='Панель содержания'
          icon={<IconShowSidebar value={showSidePanel} isBottom={false} size='1.25rem' />}
          onClick={toggleShowSidePanel}
        />
        <MiniButton
          title='Настройки отображения'
          icon={<IconSettings size='1.25rem' className='icon-primary' />}
          onClick={handleShowOptions}
        />
        <BadgeHelp topic={HelpTopic.UI_OSS_GRAPH} contentClass='sm:max-w-160' offset={4} />
      </div>
      {isMutable ? (
        <div className='cc-icons items-start'>
          <MiniButton
            aria-label='Сохранить изменения'
            titleHtml={prepareTooltip('Сохранить изменения', isMac() ? '⌘ + S' : 'Ctrl + S')}
            hideTitle={menu.isOpen}
            icon={<IconSave size='1.25rem' className='icon-primary' />}
            onClick={handleSavePositions}
            disabled={isProcessing}
          />
          <MiniButton
            aria-label='Редактировать выбранную'
            titleHtml={prepareTooltip('Редактировать выбранную', isIOS() ? '' : 'Правый клик')}
            hideTitle={isContextMenuOpen || menu.isOpen}
            icon={<IconEdit2 size='1.25rem' className='icon-primary' />}
            onClick={handleEditItem}
            disabled={selectedItems.length !== 1 || isProcessing}
          />
          <div ref={menu.ref} onBlur={menu.handleBlur} className='relative'>
            <MiniButton
              title='Добавить...'
              hideTitle={menu.isOpen}
              icon={<IconNewItem size='1.25rem' className='icon-green' />}
              onClick={handleMenuToggle}
              disabled={isProcessing}
            />
            <Dropdown isOpen={menu.isOpen} className='-translate-x-1/2'>
              <DropdownButton
                text='Новый блок'
                titleHtml={prepareTooltip('Новый блок', 'Alt + 1')}
                icon={<IconConceptBlock size='1.25rem' className='text-constructive' />}
                onClick={onCreateBlock}
              />
              <DropdownButton
                text='Новая КС'
                titleHtml={prepareTooltip('Новая концептуальная схема', 'Alt + 2')}
                icon={<IconNewItem size='1.25rem' className='text-constructive' />}
                onClick={onCreateSchema}
              />
              <DropdownButton
                text='Импорт КС'
                titleHtml={prepareTooltip('Импорт концептуальной схемы', 'Alt + 3')}
                icon={<IconDownload size='1.25rem' className='text-constructive' />}
                onClick={onImportSchema}
              />
              <DropdownButton
                text='Синтез'
                titleHtml={prepareTooltip('Синтез концептуальных схем', 'Alt + 4')}
                icon={<IconConceptBlock size='1.25rem' className='text-primary' />}
                onClick={onCreateSynthesis}
              />
              {user.is_staff ? (
                <DropdownButton
                  disabled
                  text='Фильтр'
                  titleHtml={prepareTooltip('Фильтрация конституент', 'Alt + 5')}
                  icon={<IconFilter size='1.25rem' className='icon-primary' />}
                  onClick={notImplemented}
                />
              ) : null}
              {user.is_staff ? (
                <DropdownButton
                  disabled
                  text='Релятивизация'
                  titleHtml={prepareTooltip('Релятивизация концептуальных схем', 'Alt + 6')}
                  icon={<IconClustering size='1.25rem' className='icon-primary' />}
                  onClick={notImplemented}
                />
              ) : null}
            </Dropdown>
          </div>
          <MiniButton
            aria-label='Удалить выбранную'
            titleHtml={prepareTooltip('Удалить выбранную', 'Delete')}
            hideTitle={menu.isOpen}
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
