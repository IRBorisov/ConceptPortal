'use client';

import clsx from 'clsx';

import { MiniButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { IconOSS } from '@/components/icons';
import { Label } from '@/components/input';
import { type Styling } from '@/components/props';
import { prefixes } from '@/utils/constants';

import { type LibraryItemReference } from '../models/library';

interface MiniSelectorOSSProps extends Styling {
  items: LibraryItemReference[];
  onSelect: (event: React.MouseEvent<HTMLElement>, newValue: LibraryItemReference) => void;
}

export function MiniSelectorOSS({ items, onSelect, className, ...restProps }: MiniSelectorOSSProps) {
  const { elementRef: ossRef, isOpen: isOssOpen, toggle: toggleOss, handleBlur: handleOssBlur } = useDropdown();

  function onToggle(event: React.MouseEvent<HTMLElement>) {
    if (items.length > 1) {
      toggleOss();
    } else {
      onSelect(event, items[0]);
    }
  }

  return (
    <div ref={ossRef} onBlur={handleOssBlur} className={clsx('relative flex items-center', className)} {...restProps}>
      <MiniButton
        title='Операционные схемы'
        icon={<IconOSS size='1.25rem' className='icon-primary' />}
        hideTitle={isOssOpen}
        onClick={onToggle}
      />
      {items.length > 1 ? (
        <Dropdown isOpen={isOssOpen} margin='mt-1'>
          <Label text='Список ОСС' className='border-b px-3 py-1' />
          {items.map((reference, index) => (
            <DropdownButton
              key={`${prefixes.oss_list}${index}`}
              text={reference.alias}
              className='min-w-20'
              onClick={event => onSelect(event, reference)}
            />
          ))}
        </Dropdown>
      ) : null}
    </div>
  );
}
