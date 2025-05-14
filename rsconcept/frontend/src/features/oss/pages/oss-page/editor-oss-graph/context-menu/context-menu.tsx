'use client';

import { useRef } from 'react';

import { Dropdown } from '@/components/dropdown';

import { type IBlock, type IOperation, type IOssItem } from '../../../../models/oss';
import { isOperation } from '../../../../models/oss-api';

import { MenuBlock } from './menu-block';
import { MenuOperation } from './menu-operation';

// pixels - size of OSS context menu
const MENU_WIDTH = 200;
const MENU_HEIGHT = 200;

export interface ContextMenuData {
  item: IOssItem | null;
  cursorX: number;
  cursorY: number;
}

interface ContextMenuProps extends ContextMenuData {
  isOpen: boolean;
  onHide: () => void;
}

export function ContextMenu({ isOpen, item, cursorX, cursorY, onHide }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isOperationNode = isOperation(item);

  function handleBlur(event: React.FocusEvent<HTMLDivElement>) {
    if (!ref.current?.contains(event.relatedTarget as Node)) {
      onHide();
    }
  }

  return (
    <div
      ref={ref}
      onBlur={handleBlur}
      className='fixed z-tooltip'
      style={{ top: `calc(${cursorY}px + 0.5rem)`, left: cursorX }}
    >
      <Dropdown
        className='z-navigation!'
        isOpen={isOpen}
        stretchLeft={cursorX >= window.innerWidth - MENU_WIDTH}
        stretchTop={cursorY >= window.innerHeight - MENU_HEIGHT}
        margin={cursorY >= window.innerHeight - MENU_HEIGHT ? 'mb-3' : 'mt-3'}
      >
        {!!item ? (
          isOperationNode ? (
            <MenuOperation operation={item as IOperation} onHide={onHide} />
          ) : (
            <MenuBlock block={item as IBlock} onHide={onHide} />
          )
        ) : null}
      </Dropdown>
    </div>
  );
}
