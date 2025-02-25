'use client';

import { SelectorButton } from '@/components/Control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/Dropdown';
import { type Styling } from '@/components/props';
import { prefixes } from '@/utils/constants';

import { LibraryItemType } from '../backend/types';
import { describeLibraryItemType, labelLibraryItemType } from '../labels';

import { IconLibraryItemType } from './IconLibraryItemType';

interface SelectItemTypeProps extends Styling {
  value: LibraryItemType;
  onChange: (value: LibraryItemType) => void;
  disabled?: boolean;
  stretchLeft?: boolean;
}

export function SelectItemType({ value, disabled, stretchLeft, onChange, ...restProps }: SelectItemTypeProps) {
  const menu = useDropdown();

  function handleChange(newValue: LibraryItemType) {
    menu.hide();
    if (newValue !== value) {
      onChange(newValue);
    }
  }

  return (
    <div ref={menu.ref} {...restProps}>
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
      <Dropdown isOpen={menu.isOpen} stretchLeft={stretchLeft}>
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
