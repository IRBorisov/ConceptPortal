'use client';

import clsx from 'clsx';

import { MiniButton } from '@/components/Control';
import { Dropdown, useDropdown } from '@/components/Dropdown';
import { IconFolderTree } from '@/components/Icons';
import { type Styling } from '@/components/props';
import { prefixes } from '@/utils/constants';

import { SelectLocation } from './SelectLocation';

interface SelectLocationContextProps extends Styling {
  value: string;
  onChange: (newValue: string) => void;
  title?: string;
  dropdownHeight?: string;
}

export function SelectLocationContext({
  value,
  title = 'Проводник...',
  onChange,
  className,
  dropdownHeight,
  ...restProps
}: SelectLocationContextProps) {
  const menu = useDropdown();

  function handleClick(event: React.MouseEvent<Element>, newValue: string) {
    event.preventDefault();
    event.stopPropagation();
    menu.hide();
    onChange(newValue);
  }

  return (
    <div
      ref={menu.ref}
      className={clsx('relative h-full mt-[-0.25rem] ml-[-1.5rem]', 'text-right self-start', className)}
      {...restProps}
    >
      <MiniButton
        title={title}
        hideTitle={menu.isOpen}
        icon={<IconFolderTree size='1.25rem' className='icon-green' />}
        onClick={() => menu.toggle()}
      />
      <Dropdown
        isOpen={menu.isOpen}
        className={clsx('w-[20rem] h-[12.5rem] z-modal-tooltip', dropdownHeight)}
        margin='mt-[-0.25rem]'
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
