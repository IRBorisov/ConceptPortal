'use client';

import { useEffect, useState } from 'react';
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
  const [folded, setFolded] = useState<FolderNode[]>(items);

  useEffect(() => {
    setFolded(items.filter(item => item !== activeNode && !activeNode?.hasPredecessor(item)));
  }, [items, activeNode]);

  function onFoldItem(target: FolderNode, showChildren: boolean) {
    setFolded(prev =>
      items.filter(item => {
        if (item === target) {
          return !showChildren;
        }
        if (!showChildren && item.hasPredecessor(target)) {
          return true;
        } else {
          return prev.includes(item);
        }
      })
    );
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
              !dense && 'h-7 sm:h-8',
              'pr-3 py-1 flex items-center gap-2',
              'cc-scroll-row',
              'cc-hover-bg cc-animate-color duration-fade',
              'cursor-pointer',
              'leading-3 sm:leading-4',
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
                  <IconFolderEmpty size='1rem' className='cc-controls' />
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
