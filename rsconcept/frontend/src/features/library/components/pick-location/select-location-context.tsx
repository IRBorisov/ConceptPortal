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
  const { elementRef, handleBlur, isOpen, toggle, hide } = useDropdown();

  function handleClick(newValue: string) {
    hide();
    onChange(newValue);
  }

  return (
    <div
      ref={elementRef} //
      onBlur={handleBlur}
      className={clsx('text-right self-start select-none', className)}
      {...restProps}
    >
      <MiniButton
        title={title}
        hideTitle={isOpen}
        icon={<IconFolderTree size='1.25rem' className='icon-primary' />}
        onClick={toggle}
      />
      <Dropdown isOpen={isOpen} className={clsx('w-80 z-tooltip', dropdownHeight)}>
        <SelectLocation
          value={value}
          prefix={prefixes.folders_list}
          dense
          onSelect={target => handleClick(target.getPath())}
        />
      </Dropdown>
    </div>
  );
}
