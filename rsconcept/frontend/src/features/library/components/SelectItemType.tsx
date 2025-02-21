'use client';

import { SelectorButton } from '@/components/Control';
import { type DomIconProps } from '@/components/DomainIcons';
import { Dropdown, DropdownButton, useDropdown } from '@/components/Dropdown';
import { IconOSS, IconRSForm } from '@/components/Icons';
import { type Styling } from '@/components/props';
import { prefixes } from '@/utils/constants';

import { LibraryItemType } from '../backend/types';
import { describeLibraryItemType, labelLibraryItemType } from '../labels';

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

/** Icon for library item type. */
function ItemTypeIcon({ value, size = '1.25rem', className }: DomIconProps<LibraryItemType>) {
  switch (value) {
    case LibraryItemType.RSFORM:
      return <IconRSForm size={size} className={className ?? 'text-sec-600'} />;
    case LibraryItemType.OSS:
      return <IconOSS size={size} className={className ?? 'text-ok-600'} />;
  }
}
