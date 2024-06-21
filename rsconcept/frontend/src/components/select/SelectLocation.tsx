'use client';

import { useCallback } from 'react';

import useDropdown from '@/hooks/useDropdown';
import { FolderTree } from '@/models/FolderTree';

import { IconFolderTree } from '../Icons';
import MiniButton from '../ui/MiniButton';

interface SelectLocationProps {
  value: string;
  onChange: (newValue: string) => void;

  folderTree: FolderTree;
}

function SelectLocation({ value, onChange, folderTree }: SelectLocationProps) {
  const menu = useDropdown();

  const handleChange = useCallback(
    (newValue: string) => {
      console.log(folderTree.roots.size);
      console.log(value);
      menu.hide();
      onChange(newValue);
    },
    [menu, onChange, value, folderTree]
  );

  return (
    <div ref={menu.ref} className='h-full text-right'>
      <MiniButton
        title='Проводник...'
        icon={<IconFolderTree size='1.25rem' className='icon-green' />}
        onClick={() => handleChange('/U/test')}
      />
    </div>
  );
}

export default SelectLocation;
