'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';

import { MiniButton } from '@/components/control';
import { IconFolder, IconFolderClosed, IconFolderEmpty, IconFolderOpened } from '@/components/icons';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';

import { useFolders } from '../backend/use-folders';
import { labelFolderNode } from '../labels';
import { type FolderNode } from '../models/folder-tree';

interface SelectLocationProps extends Styling {
  value: string;
  onClick: (event: React.MouseEvent<Element>, target: FolderNode) => void;

  prefix: string;
  dense?: boolean;
}

export function SelectLocation({ value, dense, prefix, onClick, className, style }: SelectLocationProps) {
  const { folders } = useFolders();
  const activeNode = folders.at(value);
  const items = folders.getTree();
  const baseFolded = useMemo(
    () => items.filter(item => item !== activeNode && !activeNode?.hasPredecessor(item)),
    [items, activeNode]
  );

  // Manual overrides: true => force folded, false => force unfolded
  const [manualOverrides, setManualOverrides] = useState<Map<FolderNode, boolean>>(new Map());

  const folded = useMemo(() => {
    const set = new Set<FolderNode>(baseFolded);
    manualOverrides.forEach((isFolded, node) => {
      if (isFolded) {
        set.add(node);
      } else {
        set.delete(node);
      }
    });
    return Array.from(set);
  }, [baseFolded, manualOverrides]);

  function onFoldItem(target: FolderNode, showChildren: boolean) {
    setManualOverrides(prev => {
      const next = new Map(prev);
      if (showChildren) {
        // Currently folded -> unfold target only
        next.set(target, false);
      } else {
        // Currently unfolded -> fold target and all its descendants
        next.set(target, true);
        for (const item of items) {
          if (item !== target && item.hasPredecessor(target)) {
            next.set(item, true);
          }
        }
      }
      return next;
    });
  }

  function handleClickFold(event: React.MouseEvent<Element>, target: FolderNode, showChildren: boolean) {
    event.preventDefault();
    event.stopPropagation();
    onFoldItem(target, showChildren);
  }

  return (
    <div className={cn('flex flex-col cc-scroll-y', className)} style={style}>
      {items.map((item, index) =>
        !item.parent || !folded.includes(item.parent) ? (
          <div
            tabIndex={-1}
            key={`${prefix}${index}`}
            className={clsx(
              !dense && 'min-h-7 sm:min-h-8',
              'pr-3 py-1 flex items-center gap-2',
              'cc-scroll-row',
              'cc-hover-bg cc-animate-color duration-fade',
              'cursor-pointer',
              'leading-3 sm:leading-4',
              'flex-shrink-0',
              activeNode === item && 'cc-selected'
            )}
            style={{ paddingLeft: `${(item.rank > 5 ? 5 : item.rank) * 0.5 + 0.5}rem` }}
            onClick={event => onClick(event, item)}
          >
            {item.children.size > 0 ? (
              <MiniButton
                noPadding
                icon={
                  folded.includes(item) ? (
                    item.filesInside ? (
                      <IconFolderClosed size='1rem' className='icon-primary' />
                    ) : (
                      <IconFolderEmpty size='1rem' className='icon-primary' />
                    )
                  ) : (
                    <IconFolderOpened size='1rem' className='icon-green' />
                  )
                }
                aria-label='Отображение вложенных папок'
                onClick={event => handleClickFold(event, item, folded.includes(item))}
              />
            ) : (
              <div>
                {item.filesInside ? (
                  <IconFolder size='1rem' className='text-foreground' />
                ) : (
                  <IconFolderEmpty size='1rem' className='text-foreground-muted' />
                )}
              </div>
            )}
            <div className='self-center text-start'>{labelFolderNode(item)}</div>
          </div>
        ) : null
      )}
    </div>
  );
}
