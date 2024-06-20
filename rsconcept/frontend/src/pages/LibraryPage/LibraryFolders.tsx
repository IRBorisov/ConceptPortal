'use client';

import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';

import { IconFolder, IconFolderClosed, IconFolderEmpty, IconFolderOpened, IconFolderTree } from '@/components/Icons';
import BadgeHelp from '@/components/info/BadgeHelp';
import { CProps } from '@/components/props';
import MiniButton from '@/components/ui/MiniButton';
import { FolderNode, FolderTree } from '@/models/FolderTree';
import { HelpTopic } from '@/models/miscellaneous';
import { animateSideAppear, animateSideView } from '@/styling/animations';
import { globals, PARAMETER, prefixes } from '@/utils/constants';
import { describeFolderNode, labelFolderNode } from '@/utils/labels';

interface LibraryTableProps {
  folders: FolderTree;
  currentFolder: string;
  setFolder: React.Dispatch<React.SetStateAction<string>>;
  toggleFolderMode: () => void;
}

function LibraryFolders({ folders, currentFolder, setFolder, toggleFolderMode }: LibraryTableProps) {
  const activeNode = useMemo(() => folders.at(currentFolder), [folders, currentFolder]);

  const items = useMemo(() => folders.getTree(), [folders]);
  const [folded, setFolded] = useState<FolderNode[]>(items);

  useLayoutEffect(() => {
    setFolded(items.filter(item => item !== activeNode && (!activeNode || !activeNode.hasPredecessor(item))));
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

  const handleSetValue = useCallback(
    (event: CProps.EventMouse, target: FolderNode) => {
      event.preventDefault();
      event.stopPropagation();
      setFolder(target.getPath());
    },
    [setFolder]
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
    <motion.div
      className='flex flex-col text:xs sm:text-sm'
      initial={{ ...animateSideView.initial }}
      animate={{ ...animateSideView.animate }}
      exit={{ ...animateSideView.exit }}
    >
      <div className='h-[2.08rem] flex justify-between items-center pr-1'>
        <BadgeHelp
          topic={HelpTopic.UI_LIBRARY}
          className={clsx(PARAMETER.TOOLTIP_WIDTH, 'text-sm')}
          offset={5}
          place='right-start'
        />
        <MiniButton
          icon={<IconFolderTree size='1.25rem' className='icon-green' />}
          title='Режим: проводник'
          onClick={toggleFolderMode}
        />
      </div>
      <div
        className={clsx(
          'max-w-[10rem] sm:max-w-[15rem] min-w-[10rem] sm:min-w-[15rem]',
          'flex flex-col',
          'cc-scroll-y'
        )}
      >
        <AnimatePresence>
          {items.map((item, index) =>
            !item.parent || !folded.includes(item.parent) ? (
              <motion.div
                tabIndex={-1}
                key={`${prefixes.folders_list}${index}`}
                className={clsx(
                  'min-h-[2.0825rem] sm:min-h-[2.3125rem]',
                  'pr-3 flex items-center gap-2',
                  'cc-scroll-row',
                  'clr-hover',
                  'cursor-pointer',
                  activeNode === item && 'clr-selected'
                )}
                style={{ paddingLeft: `${(item.rank > 5 ? 5 : item.rank) * 0.5 + 0.5}rem` }}
                data-tooltip-id={globals.tooltip}
                data-tooltip-html={describeFolderNode(item)}
                onClick={event => handleSetValue(event, item)}
                initial={{ ...animateSideAppear.initial }}
                animate={{ ...animateSideAppear.animate }}
                exit={{ ...animateSideAppear.exit }}
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
                <div className='self-center'>{labelFolderNode(item)}</div>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default LibraryFolders;
