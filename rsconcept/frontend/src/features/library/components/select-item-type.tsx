'use client';

import clsx from 'clsx';

import { SelectorButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { type Styling } from '@/components/props';
import { prefixes } from '@/utils/constants';

import { LibraryItemType } from '../backend/types';
import { describeLibraryItemType, labelLibraryItemType } from '../labels';

import { IconLibraryItemType } from './icon-library-item-type';

interface SelectItemTypeProps extends Styling {
  value: LibraryItemType;
  onChange: (value: LibraryItemType) => void;
  disabled?: boolean;
  stretchLeft?: boolean;
}

export function SelectItemType({
  value,
  disabled,
  className,
  stretchLeft,
  onChange,
  ...restProps
}: SelectItemTypeProps) {
  const menu = useDropdown();

  function handleChange(newValue: LibraryItemType) {
    menu.hide();
    if (newValue !== value) {
      onChange(newValue);
    }
  }

  return (
    <div ref={menu.ref} onBlur={menu.handleBlur} className={clsx('relative', className)} {...restProps}>
      <SelectorButton
        transparent
        title={describeLibraryItemType(value)}
        hideTitle={menu.isOpen}
        className='h-full px-2 py-1 rounded-lg'
        icon={<IconLibraryItemType value={value} size='1.25rem' />}
        text={labelLibraryItemType(value)}
        onClick={menu.toggle}
        disabled={disabled}
      />
      <Dropdown isOpen={menu.isOpen} stretchLeft={stretchLeft} margin='mt-1'>
        {Object.values(LibraryItemType).map((item, index) => (
          <DropdownButton
            key={`${prefixes.policy_list}${index}`}
            text={labelLibraryItemType(item)}
            title={describeLibraryItemType(item)}
            icon={<IconLibraryItemType value={item} size='1rem' />}
            onClick={() => handleChange(item)}
          />
        ))}
      </Dropdown>
    </div>
  );
}
