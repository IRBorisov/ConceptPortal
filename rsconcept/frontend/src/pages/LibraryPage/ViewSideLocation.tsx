import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';

import { IconFolderTree } from '@/components/Icons';
import BadgeHelp from '@/components/info/BadgeHelp';
import { CProps } from '@/components/props';
import SelectLocation from '@/components/select/SelectLocation';
import MiniButton from '@/components/ui/MiniButton';
import useWindowSize from '@/hooks/useWindowSize';
import { FolderNode, FolderTree } from '@/models/FolderTree';
import { HelpTopic } from '@/models/miscellaneous';
import { animateSideMinWidth } from '@/styling/animations';
import { PARAMETER, prefixes } from '@/utils/constants';
import { information } from '@/utils/labels';

interface ViewSideLocationProps {
  folderTree: FolderTree;
  active: string;
  setActive: React.Dispatch<React.SetStateAction<string>>;
  toggleFolderMode: () => void;
}

function ViewSideLocation({ folderTree, active, setActive: setActive, toggleFolderMode }: ViewSideLocationProps) {
  const windowSize = useWindowSize();
  const handleClickFolder = useCallback(
    (event: CProps.EventMouse, target: FolderNode) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.ctrlKey || event.metaKey) {
        navigator.clipboard
          .writeText(target.getPath())
          .then(() => toast.success(information.pathReady))
          .catch(console.error);
      } else {
        setActive(target.getPath());
      }
    },
    [setActive]
  );

  const animations = useMemo(() => animateSideMinWidth(windowSize.isSmall ? '10rem' : '15rem'), [windowSize]);

  return (
    <motion.div
      className={clsx('max-w-[10rem] sm:max-w-[15rem]', 'flex flex-col', 'text:xs sm:text-sm', 'select-none')}
      initial={{ ...animations.initial }}
      animate={{ ...animations.animate }}
      exit={{ ...animations.exit }}
    >
      <div className='h-[2.08rem] flex justify-between items-center pr-1 pl-[0.125rem]'>
        <BadgeHelp
          topic={HelpTopic.UI_LIBRARY}
          className={clsx(PARAMETER.TOOLTIP_WIDTH, 'text-sm')}
          offset={5}
          place='right-start'
        />
        <MiniButton
          icon={<IconFolderTree size='1.25rem' className='icon-green' />}
          title='Переключение в режим Поиск'
          onClick={toggleFolderMode}
        />
      </div>
      <SelectLocation
        value={active}
        folderTree={folderTree}
        prefix={prefixes.folders_list}
        onClick={handleClickFolder}
      />
    </motion.div>
  );
}

export default ViewSideLocation;
