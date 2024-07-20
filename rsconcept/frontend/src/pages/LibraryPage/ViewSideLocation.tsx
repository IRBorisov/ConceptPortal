import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useCallback } from 'react';
import { toast } from 'react-toastify';

import { IconFolderTree } from '@/components/Icons';
import BadgeHelp from '@/components/info/BadgeHelp';
import { CProps } from '@/components/props';
import SelectLocation from '@/components/select/SelectLocation';
import MiniButton from '@/components/ui/MiniButton';
import { FolderNode, FolderTree } from '@/models/FolderTree';
import { HelpTopic } from '@/models/miscellaneous';
import { animateSideView } from '@/styling/animations';
import { PARAMETER, prefixes } from '@/utils/constants';
import { information } from '@/utils/labels';

interface ViewSideLocationProps {
  folderTree: FolderTree;
  active: string;
  setActive: React.Dispatch<React.SetStateAction<string>>;
  toggleFolderMode: () => void;
}

function ViewSideLocation({ folderTree, active, setActive: setActive, toggleFolderMode }: ViewSideLocationProps) {
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

  return (
    <motion.div
      className='flex flex-col select-none text:xs sm:text-sm max-w-[10rem] sm:max-w-[15rem] min-w-[10rem] sm:min-w-[15rem]'
      initial={{ ...animateSideView.initial }}
      animate={{ ...animateSideView.animate }}
      exit={{ ...animateSideView.exit }}
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
