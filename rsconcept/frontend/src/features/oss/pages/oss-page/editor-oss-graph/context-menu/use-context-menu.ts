'use client';

import { useState } from 'react';
import { useStoreApi } from 'reactflow';

import { type OssNode } from '../../../../models/oss-layout';
import { useOperationTooltipStore } from '../../../../stores/operation-tooltip';

import { type ContextMenuData } from './context-menu';

export function useContextMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [menuProps, setMenuProps] = useState<ContextMenuData>({
    item: null,
    cursorX: 0,
    cursorY: 0
  });

  const setHoverOperation = useOperationTooltipStore(state => state.setHoverItem);
  const { addSelectedNodes } = useStoreApi().getState();

  function openContextMenu(node: OssNode, clientX: number, clientY: number) {
    addSelectedNodes([node.id]);
    setMenuProps({
      item: node.type === 'block' ? node.data.block ?? null : node.data.operation ?? null,
      cursorX: clientX,
      cursorY: clientY
    });
    setIsOpen(true);
    setHoverOperation(null);
  }

  function hideContextMenu() {
    setIsOpen(false);
  }

  return {
    isOpen,
    menuProps,
    openContextMenu,
    hideContextMenu
  };
}
