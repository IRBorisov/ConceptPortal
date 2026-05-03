'use client';

import { toast } from 'react-toastify';
import clsx from 'clsx';

import { type FolderNode } from '@/domain/library';
import { useTx } from '@/i18n';

import { useMainHeight } from '@/stores/app-layout';
import { prefixes } from '@/utils/constants';

import { SelectLocation } from '../../components/select-location';
import { useLibrarySearchStore } from '../../stores/library-search';

interface ViewSideLocationProps {
  className?: string;
}

export function ViewSideLocation({ className }: ViewSideLocationProps) {
  const tx = useTx();
  const location = useLibrarySearchStore(state => state.location);
  const setLocation = useLibrarySearchStore(state => state.setLocation);

  const maxHeight = useMainHeight();

  function handleSelectFolder(target: FolderNode) {
    setLocation(target.getPath());
  }

  function handleCopyPath(target: FolderNode) {
    navigator.clipboard
      .writeText(target.getPath())
      .then(() => toast.success(tx('labels.info.pathReady')))
      .catch(console.error);
  }

  return (
    <div
      className={clsx(
        'relative',
        'border-r border-b bg-input',
        'flex flex-col text:xs sm:text-sm select-none',
        className
      )}
    >
      <SelectLocation
        className='cc-scroll-left cc-scroll-stable'
        value={location}
        prefix={prefixes.folders_list}
        onSelect={handleSelectFolder}
        onControlClick={handleCopyPath}
        style={{ maxHeight: maxHeight }}
      />
    </div>
  );
}
