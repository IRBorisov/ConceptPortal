'use client';

import { useCallback } from 'react';

import { ItemTypeIcon } from '@/components/DomainIcons';
import { CProps } from '@/components/props';
import Dropdown from '@/components/ui/Dropdown';
import DropdownButton from '@/components/ui/DropdownButton';
import SelectorButton from '@/components/ui/SelectorButton';
import useDropdown from '@/hooks/useDropdown';
import { LibraryItemType } from '@/models/library';
import { prefixes } from '@/utils/constants';
import { describeLibraryItemType, labelLibraryItemType } from '@/utils/labels';

interface SelectItemTypeProps extends CProps.Styling {
  value: LibraryItemType;
  onChange: (value: LibraryItemType) => void;
  disabled?: boolean;
  stretchLeft?: boolean;
}

function SelectItemType({ value, disabled, stretchLeft, onChange, ...restProps }: SelectItemTypeProps) {
  const menu = useDropdown();

  const handleChange = useCallback(
    (newValue: LibraryItemType) => {
      menu.hide();
      if (newValue !== value) {
        onChange(newValue);
      }
    },
    [menu, value, onChange]
  );

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
