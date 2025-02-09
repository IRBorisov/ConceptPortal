'use client';

import { SelectorButton } from '@/components/Control';
import { ItemTypeIcon } from '@/components/DomainIcons';
import { Dropdown, DropdownButton, useDropdown } from '@/components/Dropdown';
import { CProps } from '@/components/props';
import { prefixes } from '@/utils/constants';
import { describeLibraryItemType, labelLibraryItemType } from '@/utils/labels';

import { LibraryItemType } from '../models/library';

interface SelectItemTypeProps extends CProps.Styling {
  value: LibraryItemType;
  onChange: (value: LibraryItemType) => void;
  disabled?: boolean;
  stretchLeft?: boolean;
}

function SelectItemType({ value, disabled, stretchLeft, onChange, ...restProps }: SelectItemTypeProps) {
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
        icon={<ItemTypeIcon value={value} size='1.25rem' />}
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
            icon={<ItemTypeIcon value={item} size='1rem' />}
            onClick={() => handleChange(item)}
          />
        ))}
      </Dropdown>
    </div>
  );
}

export default SelectItemType;
