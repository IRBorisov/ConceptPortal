'use client';

import clsx from 'clsx';

import { useTx } from '@/i18n';

import { MiniButton } from '@/components/control';
import { Dropdown, useDropdown } from '@/components/dropdown';
import { IconFolderTree } from '@/components/icons';
import { type Styling } from '@/components/props';
import { prefixes } from '@/utils/constants';

import { SelectLocation } from '../select-location';

interface SelectLocationContextProps extends Styling {
  /** Currently selected location path. */
  value: string;
  onChange: (newValue: string) => void;
  /** Tooltip for the folder-tree button. */
  title?: string;
  /** Max height class for the dropdown panel. */
  dropdownHeight?: string;
}

/** Dropdown button that opens {@link SelectLocation} to pick a library folder path. */
export function SelectLocationContext({
  value,
  title,
  onChange,
  className,
  dropdownHeight = 'h-50',
  ...restProps
}: SelectLocationContextProps) {
  const tx = useTx();
  const { elementRef, handleBlur, isOpen, toggle, hide } = useDropdown();
  const explorerTitle = title ?? tx('tx.lib.location.select');

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
        title={explorerTitle}
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
