'use client';

import clsx from 'clsx';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';

import { FolderNode, FolderTree } from '@/models/FolderTree';
import { labelFolderNode } from '@/utils/labels';

import { IconFolder, IconFolderClosed, IconFolderEmpty, IconFolderOpened } from '../Icons';
import { CProps } from '../props';
import MiniButton from '../ui/MiniButton';

interface SelectLocationProps extends CProps.Styling {
  value: string;
  folderTree: FolderTree;
  prefix: string;
  dense?: boolean;
  onClick: (event: CProps.EventMouse, target: FolderNode) => void;
}

function SelectLocation({ value, folderTree, dense, prefix, onClick, className, style }: SelectLocationProps) {
  const activeNode = useMemo(() => folderTree.at(value), [folderTree, value]);

  const items = useMemo(() => folderTree.getTree(), [folderTree]);
  const [folded, setFolded] = useState<FolderNode[]>(items);

  useLayoutEffect(() => {
    setFolded(items.filter(item => item !== activeNode && !activeNode?.hasPredecessor(item)));
  }, [items, activeNode]);

  const onFoldItem = useCallback(
    (target: FolderNode, showChildren: boolean) => {
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
    },
    [items]
  );

  const handleClickFold = useCallback(
    (event: CProps.EventMouse, target: FolderNode, showChildren: boolean) => {
      event.preventDefault();
      event.stopPropagation();
      onFoldItem(target, showChildren);
    },
    [onFoldItem]
  );

  return (
    <div className={clsx('flex flex-col', 'cc-scroll-y', className)} style={style}>
      {items.map((item, index) =>
        !item.parent || !folded.includes(item.parent) ? (
          <div
            tabIndex={-1}
            key={`${prefix}${index}`}
            className={clsx(
              !dense && 'min-h-[2.0825rem] sm:min-h-[2.3125rem]',
              'pr-3 py-1 flex items-center gap-2',
              'cc-scroll-row',
              'clr-hover',
              'cursor-pointer',
              'leading-3 sm:leading-4',
              activeNode === item && 'clr-selected'
            )}
            style={{ paddingLeft: `${(item.rank > 5 ? 5 : item.rank) * 0.5 + 0.5}rem` }}
            onClick={event => onClick(event, item)}
          >
            {item.children.size > 0 ? (
              <MiniButton
                noPadding
                noHover
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
                onClick={event => handleClickFold(event, item, folded.includes(item))}
              />
            ) : (
              <div>
                {item.filesInside ? (
                  <IconFolder size='1rem' className='clr-text-default' />
                ) : (
                  <IconFolderEmpty size='1rem' className='clr-text-controls' />
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

export default SelectLocation;
