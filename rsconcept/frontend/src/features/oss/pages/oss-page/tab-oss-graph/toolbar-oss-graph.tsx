'use client';

import React from 'react';

import { NodeType } from '@rsconcept/domain/library';
import { useTx } from '@/i18n';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { IconShowSidebar } from '@/features/library/components/icon-show-sidebar';

import { MiniButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import {
  IconConceptBlock,
  IconDestroy,
  IconDownload,
  IconEdit2,
  IconFitImage,
  IconImage,
  IconNewItem,
  IconPNG,
  IconReset,
  IconSave,
  IconSettings,
  IconSVG,
  IconSynthesis
} from '@/components/icons';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { usePreferencesStore } from '@/stores/preferences';
import { prepareTooltip } from '@/utils/format';
import { isIOS, isMac } from '@/utils/utils';

import { useMutatingOss } from '../../../backend/use-mutating-oss';
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
  const tx = useTx();
  const { selectedItems, isMutable, canDeleteSelected } = useOssEdit();
  const isProcessing = useMutatingOss();
  const { nodes } = useOssFlow();

  const {
    elementRef: menuRef, //
    isOpen: isMenuOpen,
    toggle: toggleMenu,
    handleBlur: handleMenuBlur
  } = useDropdown();

  const {
    elementRef: exportRef,
    isOpen: isExportOpen,
    toggle: toggleExport,
    handleBlur: handleExportBlur
  } = useDropdown();

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
    handleExportSVG,
    handleExportPNG,
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

  function handleExportSvgBtn() {
    toggleExport();
    void handleExportSVG();
  }

  function handleExportPngBtn() {
    toggleExport();
    void handleExportPNG();
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
          title={prepareTooltip(tx('tx.general.changes.reset'), 'Z')}
          icon={<IconReset size='1.25rem' className='icon-primary' />}
          onClick={handleResetPositions}
        />
        <MiniButton
          title={prepareTooltip(tx('tx.flow.fitView'), 'G')}
          icon={<IconFitImage size='1.25rem' className='icon-primary' />}
          onClick={handleFitView}
        />
        <MiniButton
          title={prepareTooltip(tx('tx.oss.sidebar.contents'), 'V')}
          icon={<IconShowSidebar value={showSidePanel} isBottom={false} size='1.25rem' />}
          onClick={handleShowSidePanel}
        />
        <MiniButton
          title={tx('tx.general.settings')}
          icon={<IconSettings size='1.25rem' className='icon-primary' />}
          onClick={handleShowOptions}
        />
        <div ref={exportRef} onBlur={handleExportBlur} className='relative flex'>
          <MiniButton
            title={tx('tx.general.images.save')}
            hideTitle={isExportOpen}
            icon={<IconImage size='1.25rem' className='icon-primary' />}
            onClick={toggleExport}
            disabled={isProcessing || isExportingImage}
          />
          <Dropdown isOpen={isExportOpen} className='-translate-x-1/2'>
            <DropdownButton
              icon={<IconPNG size='1.25rem' className='icon-primary' />}
              text={tx('tx.general.save') + ' PNG'}
              onClick={handleExportPngBtn}
              disabled={isProcessing || isExportingImage}
            />
            <DropdownButton
              icon={<IconSVG size='1.25rem' className='icon-primary' />}
              text={tx('tx.general.save') + ' SVG'}
              onClick={handleExportSvgBtn}
              disabled={isProcessing || isExportingImage}
            />
          </Dropdown>
        </div>

        <BadgeHelp topic={HelpTopic.UI_OSS_GRAPH} contentClass='sm:max-w-160' offset={4} />
      </div>
      {isMutable ? (
        <div className='cc-icons items-start'>
          <MiniButton
            aria-label={tx('tx.general.changes.save')}
            title={prepareTooltip(tx('tx.general.changes.save'), isMac() ? 'Cmd + S' : 'Ctrl + S')}
            hideTitle={isMenuOpen}
            icon={<IconSave size='1.25rem' className='icon-primary' />}
            onClick={handleSavePositions}
            disabled={isProcessing}
          />
          <MiniButton
            aria-label={tx('tx.general.selection.selected.edit')}
            title={prepareTooltip(tx('tx.general.selection.selected.edit'), isIOS() ? '' : tx('tx.general.rightClick'))}
            hideTitle={isContextMenuOpen || isMenuOpen}
            icon={<IconEdit2 size='1.25rem' className='icon-primary' />}
            onClick={handleEditItem}
            disabled={selectedItems.length !== 1 || isProcessing}
          />
          <div ref={menuRef} onBlur={handleMenuBlur} className='relative'>
            <MiniButton
              title={tx('tx.general.add') + '...'}
              hideTitle={isMenuOpen}
              icon={<IconNewItem size='1.25rem' className='icon-green' />}
              onClick={handleMenuToggle}
              disabled={isProcessing}
            />
            <Dropdown isOpen={isMenuOpen} className='-translate-x-1/2'>
              <DropdownButton
                text={tx('tx.oss.block.new')}
                title={prepareTooltip(tx('tx.oss.block.new'), '1')}
                icon={<IconConceptBlock size='1.25rem' className='text-constructive' />}
                onClick={handleCreateBlock}
              />
              <DropdownButton
                text={tx('tx.schema.new.short')}
                title={prepareTooltip(tx('tx.schema.new'), '2')}
                icon={<IconNewItem size='1.25rem' className='text-constructive' />}
                onClick={handleCreateSchema}
              />
              <DropdownButton
                text={tx('tx.oss.input.import')}
                title={prepareTooltip(tx('tx.schema.embed'), '3')}
                icon={<IconDownload size='1.25rem' className='text-primary' />}
                onClick={handleImportSchema}
              />
              <DropdownButton
                text={tx('tx.synthesis.short')}
                title={prepareTooltip(tx('tx.synthesis'), '4')}
                icon={<IconSynthesis size='1.25rem' className='text-primary' />}
                onClick={handleCreateSynthesis}
              />
            </Dropdown>
          </div>
          <MiniButton
            aria-label={tx('tx.general.selection.selected.delete')}
            title={prepareTooltip(tx('tx.general.selection.selected.delete'), 'Delete, `')}
            hideTitle={isMenuOpen}
            icon={<IconDestroy size='1.25rem' className='icon-red' />}
            onClick={handleDeleteSelected}
            disabled={isProcessing || !canDeleteSelected}
          />
        </div>
      ) : null}
    </div>
  );
}
