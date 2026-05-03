'use client';

import { useState } from 'react';

import { type FolderNode } from '@/domain/library';
import { useTx } from '@/i18n';

import { MiniButton } from '@/components/control';
import { IconFolder, IconFolderClosed, IconFolderEmpty, IconFolderOpened } from '@/components/icons';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';

import { useFolders } from '../backend/use-folders';
import { labelFolderNode } from '../labels';

interface SelectLocationProps extends Styling {
  value: string;
  onSelect: (target: FolderNode) => void;
  onControlClick?: (target: FolderNode) => void;

  prefix: string;
  dense?: boolean;
}

export function SelectLocation({
  value,
  dense,
  prefix,
  onSelect,
  onControlClick,
  className,
  style
}: SelectLocationProps) {
  const tx = useTx();
  const { folders } = useFolders();
  const activeNode = folders.at(value);
  const items = folders.getTree();
  const baseFolded = items.filter(item => item !== activeNode && !activeNode?.hasPredecessor(item));

  // Manual overrides: true => force folded, false => force unfolded
  const [manualOverrides, setManualOverrides] = useState<Map<FolderNode, boolean>>(new Map());

  const folded = (() => {
    const set = new Set<FolderNode>(baseFolded);
    manualOverrides.forEach((isFolded, node) => {
      if (isFolded) {
        set.add(node);
      } else {
        set.delete(node);
      }
    });
    return Array.from(set);
  })();

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

  function onClickFold(event: React.MouseEvent<Element>, target: FolderNode) {
    event.preventDefault();
    event.stopPropagation();
    onFoldItem(target, folded.includes(target));
  }

  function onClickRow(event: React.MouseEvent<Element>, target: FolderNode) {
    event.preventDefault();
    if (onControlClick && (event.ctrlKey || event.metaKey)) {
      onControlClick(target);
      return;
    }
    onSelect(target);
  }

  return (
    <div className={cn('flex flex-col cc-scroll-y', className)} style={style}>
      {items.map((item, index) =>
        !item.parent || !folded.includes(item.parent) ? (
          <div
            tabIndex={-1}
            key={`${prefix}${index}`}
            className={cn(
              !dense && (item.parent ? 'min-h-7 sm:min-h-8' : 'min-h-9 sm:min-h-10'),
              item.parent ? 'pr-3 py-1' : 'px-3 py-2',
              'flex items-center gap-2',
              'cc-scroll-row',
              'cc-hover-bg cc-animate-color duration-fade',
              'cursor-pointer',
              'leading-3 sm:leading-4',
              'shrink-0',
              !item.parent && 'font-controls text-muted-foreground',
              activeNode === item && 'cc-selected',
              !item.parent && activeNode === item && 'text-foreground'
            )}
            style={{ paddingLeft: `${(item.rank > 5 ? 5 : item.rank) * 0.5 + 0.5}rem` }}
            onClick={event => onClickRow(event, item)}
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
                aria-label={tx('ui.library.showNestedFoldersAria')}
                onClick={event => onClickFold(event, item)}
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
