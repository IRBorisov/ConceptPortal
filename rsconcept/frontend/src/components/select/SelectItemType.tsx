'use client';

import { useCallback } from 'react';

import Dropdown from '@/components/ui/Dropdown';
import useDropdown from '@/hooks/useDropdown';
import { LibraryItemType } from '@/models/library';
import { prefixes } from '@/utils/constants';
import { describeLibraryItemType, labelLibraryItemType } from '@/utils/labels';

import { ItemTypeIcon } from '../DomainIcons';
import DropdownButton from '../ui/DropdownButton';
import SelectorButton from '../ui/SelectorButton';

interface SelectItemTypeProps {
  value: LibraryItemType;
  onChange: (value: LibraryItemType) => void;
  disabled?: boolean;
  stretchLeft?: boolean;
}

function SelectItemType({ value, disabled, stretchLeft, onChange }: SelectItemTypeProps) {
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
    <div ref={menu.ref}>
      <SelectorButton
        transparent
        title={describeLibraryItemType(value)}
        hideTitle={menu.isOpen}
        className='h-full py-1 px-2 disabled:cursor-auto rounded-lg'
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
