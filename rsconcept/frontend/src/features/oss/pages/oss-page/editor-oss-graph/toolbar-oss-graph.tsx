'use client';

import React from 'react';

import { useAuthSuspense } from '@/features/auth/backend/use-auth';
import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { IconShowSidebar } from '@/features/library/components/icon-show-sidebar';

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
  IconImage,
  IconNewItem,
  IconReset,
  IconSave,
  IconSettings,
  IconSynthesis
} from '@/components/icons';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { usePreferencesStore } from '@/stores/preferences';
import { isIOS, isMac, notImplemented, prepareTooltip } from '@/utils/utils';

import { useMutatingOss } from '../../../backend/use-mutating-oss';
import { NodeType } from '../../../models/oss';
import { useOssEdit } from '../oss-edit-context';

import { type OGNode } from './graph/og-models';
import { useOssFlow } from './oss-flow-context';
import { useHandleActions } from './use-handle-actions';

interface ToolbarOssGraphProps extends Styling {
  isContextMenuOpen: boolean;
  openContextMenu: (node: OGNode, clientX: number, clientY: number) => void;
  hideContextMenu: () => void;
}

export function ToolbarOssGraph({
  isContextMenuOpen,
  openContextMenu,
  hideContextMenu,
  className,
  ...restProps
}: ToolbarOssGraphProps) {
  const { selectedItems, isMutable, canDeleteOperation: canDelete } = useOssEdit();
  const isProcessing = useMutatingOss();
  const { nodes } = useOssFlow();
  const { user } = useAuthSuspense();
  const { elementRef: menuRef, isOpen: isMenuOpen, toggle: toggleMenu, handleBlur: handleMenuBlur } = useDropdown();
  const {
    handleFitView,
    handleSavePositions,
    handleCreateSynthesis,
    handleCreateBlock,
    handleCreateSchema,
    handleImportSchema,
    handleDeleteSelected,
    handleResetPositions,
    handleShowOptions,
    handleShowSidePanel,
    handleExportImage,
    isExportingImage
  } = useHandleActions();

  const showSidePanel = usePreferencesStore(state => state.showOssSidePanel);

  const selectedOperation =
    selectedItems.length === 1 && selectedItems[0].nodeType === NodeType.OPERATION ? selectedItems[0] : null;
  const selectedBlock =
    selectedItems.length === 1 && selectedItems[0].nodeType === NodeType.BLOCK ? selectedItems[0] : null;

  function handleMenuToggle() {
    hideContextMenu();
    toggleMenu();
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
        'grid justify-items-center', //
        'rounded-b-2xl hover:bg-background backdrop-blur-xs',
        className
      )}
      {...restProps}
    >
      <div className='cc-icons'>
        <MiniButton
          titleHtml={prepareTooltip('Сбросить изменения', 'Z')}
          icon={<IconReset size='1.25rem' className='icon-primary' />}
          onClick={handleResetPositions}
        />
        <MiniButton
          titleHtml={prepareTooltip('Сбросить вид', 'G')}
          icon={<IconFitImage size='1.25rem' className='icon-primary' />}
          onClick={handleFitView}
        />
        <MiniButton
          titleHtml={prepareTooltip('Панель содержания', 'V')}
          icon={<IconShowSidebar value={showSidePanel} isBottom={false} size='1.25rem' />}
          onClick={handleShowSidePanel}
        />
        <MiniButton
          title='Настройки отображения'
          icon={<IconSettings size='1.25rem' className='icon-primary' />}
          onClick={handleShowOptions}
        />
        <MiniButton
          icon={<IconImage size='1.25rem' className='icon-primary' />}
          title='Сохранить изображение'
          onClick={() => void handleExportImage()}
          disabled={isProcessing || isExportingImage}
        />
        <BadgeHelp topic={HelpTopic.UI_OSS_GRAPH} contentClass='sm:max-w-160' offset={4} />
      </div>
      {isMutable ? (
        <div className='cc-icons items-start'>
          <MiniButton
            aria-label='Сохранить изменения'
            titleHtml={prepareTooltip('Сохранить изменения', isMac() ? '⌘ + S' : 'Ctrl + S')}
            hideTitle={isMenuOpen}
            icon={<IconSave size='1.25rem' className='icon-primary' />}
            onClick={handleSavePositions}
            disabled={isProcessing}
          />
          <MiniButton
            aria-label='Редактировать выбранную'
            titleHtml={prepareTooltip('Редактировать выбранную', isIOS() ? '' : 'Правый клик')}
            hideTitle={isContextMenuOpen || isMenuOpen}
            icon={<IconEdit2 size='1.25rem' className='icon-primary' />}
            onClick={handleEditItem}
            disabled={selectedItems.length !== 1 || isProcessing}
          />
          <div ref={menuRef} onBlur={handleMenuBlur} className='relative'>
            <MiniButton
              title='Добавить...'
              hideTitle={isMenuOpen}
              icon={<IconNewItem size='1.25rem' className='icon-green' />}
              onClick={handleMenuToggle}
              disabled={isProcessing}
            />
            <Dropdown isOpen={isMenuOpen} className='-translate-x-1/2'>
              <DropdownButton
                text='Новый блок'
                titleHtml={prepareTooltip('Новый блок', '1')}
                icon={<IconConceptBlock size='1.25rem' className='text-constructive' />}
                onClick={handleCreateBlock}
              />
              <DropdownButton
                text='Новая КС'
                titleHtml={prepareTooltip('Новая концептуальная схема', '2')}
                icon={<IconNewItem size='1.25rem' className='text-constructive' />}
                onClick={handleCreateSchema}
              />
              <DropdownButton
                text='Импорт КС'
                titleHtml={prepareTooltip('Импорт концептуальной схемы', '3')}
                icon={<IconDownload size='1.25rem' className='text-primary' />}
                onClick={handleImportSchema}
              />
              <DropdownButton
                text='Синтез'
                titleHtml={prepareTooltip('Синтез концептуальных схем', '4')}
                icon={<IconSynthesis size='1.25rem' className='text-primary' />}
                onClick={handleCreateSynthesis}
              />
              {user.is_staff ? (
                <DropdownButton
                  disabled
                  text='Фильтр'
                  titleHtml={prepareTooltip('Фильтрация конституент', '5')}
                  icon={<IconFilter size='1.25rem' className='icon-primary' />}
                  onClick={notImplemented}
                />
              ) : null}
              {user.is_staff ? (
                <DropdownButton
                  disabled
                  text='Релятивизация'
                  titleHtml={prepareTooltip('Релятивизация концептуальных схем', '6')}
                  icon={<IconClustering size='1.25rem' className='icon-primary' />}
                  onClick={notImplemented}
                />
              ) : null}
            </Dropdown>
          </div>
          <MiniButton
            aria-label='Удалить выбранную'
            titleHtml={prepareTooltip('Удалить выбранную', 'Delete, `')}
            hideTitle={isMenuOpen}
            icon={<IconDestroy size='1.25rem' className='icon-red' />}
            onClick={handleDeleteSelected}
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
