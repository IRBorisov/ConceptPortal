'use client';

import clsx from 'clsx';
import { useCallback } from 'react';

import useDropdown from '@/hooks/useDropdown';
import { prefixes } from '@/utils/constants';

import { IconFolderTree } from '../Icons';
import { CProps } from '../props';
import Dropdown from '../ui/Dropdown';
import MiniButton from '../ui/MiniButton';
import SelectLocation from './SelectLocation';

interface SelectLocationContextProps extends CProps.Styling {
  value: string;
  title?: string;
  stretchTop?: boolean;

  onChange: (newValue: string) => void;
}

function SelectLocationContext({
  value,
  title = 'Проводник...',
  onChange,
  className,
  style
}: SelectLocationContextProps) {
  const menu = useDropdown();

  const handleClick = useCallback(
    (event: CProps.EventMouse, newValue: string) => {
      event.preventDefault();
      event.stopPropagation();
      menu.hide();
      onChange(newValue);
    },
    [menu, onChange]
  );

  return (
    <div ref={menu.ref} className='h-full text-right self-start mt-[-0.25rem] ml-[-1.5rem]'>
      <MiniButton
        title={title}
        hideTitle={menu.isOpen}
        icon={<IconFolderTree size='1.25rem' className='icon-green' />}
        onClick={() => menu.toggle()}
      />
      <Dropdown
        isOpen={menu.isOpen}
        className={clsx('w-[20rem] h-[12.5rem] z-modalTooltip mt-[-0.25rem]', className)}
        style={style}
      >
        <SelectLocation
          value={value}
          prefix={prefixes.folders_list}
          dense
          onClick={(event, target) => handleClick(event, target.getPath())}
        />
      </Dropdown>
    </div>
  );
}

export default SelectLocationContext;
