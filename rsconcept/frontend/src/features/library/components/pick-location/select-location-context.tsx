'use client';

import clsx from 'clsx';

import { MiniButton } from '@/components/control';
import { Dropdown, useDropdown } from '@/components/dropdown';
import { IconFolderTree } from '@/components/icons';
import { type Styling } from '@/components/props';
import { prefixes } from '@/utils/constants';

import { SelectLocation } from '../select-location';

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
  dropdownHeight = 'h-50',
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
      ref={menu.ref} //
      onBlur={menu.handleBlur}
      className={clsx('text-right self-start', className)}
      {...restProps}
    >
      <MiniButton
        title={title}
        hideTitle={menu.isOpen}
        icon={<IconFolderTree size='1.25rem' className='icon-primary' />}
        onClick={() => menu.toggle()}
      />
      <Dropdown isOpen={menu.isOpen} className={clsx('w-80 z-tooltip', dropdownHeight)}>
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
