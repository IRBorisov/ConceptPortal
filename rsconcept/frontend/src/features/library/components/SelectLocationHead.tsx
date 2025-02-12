'use client';

import clsx from 'clsx';

import { SelectorButton } from '@/components/Control';
import { LocationIcon } from '@/components/DomainIcons';
import { Dropdown, DropdownButton, useDropdown } from '@/components/Dropdown';
import { CProps } from '@/components/props';
import { prefixes } from '@/utils/constants';

import { describeLocationHead, labelLocationHead } from '../labels';
import { LocationHead } from '../models/library';

interface SelectLocationHeadProps extends CProps.Styling {
  value: LocationHead;
  onChange: (newValue: LocationHead) => void;
  excluded?: LocationHead[];
}

export function SelectLocationHead({
  value,
  excluded = [],
  onChange,
  className,
  ...restProps
}: SelectLocationHeadProps) {
  const menu = useDropdown();

  function handleChange(newValue: LocationHead) {
    menu.hide();
    onChange(newValue);
  }

  return (
    <div ref={menu.ref} className={clsx('h-full text-right', className)} {...restProps}>
      <SelectorButton
        transparent
        tabIndex={-1}
        title={describeLocationHead(value)}
        hideTitle={menu.isOpen}
        className='h-full'
        icon={<LocationIcon value={value} size='1rem' />}
        text={labelLocationHead(value)}
        onClick={menu.toggle}
      />

      <Dropdown isOpen={menu.isOpen} className='z-modalTooltip'>
        {Object.values(LocationHead)
          .filter(head => !excluded.includes(head))
          .map((head, index) => {
            return (
              <DropdownButton
                className='w-[10rem]'
                key={`${prefixes.location_head_list}${index}`}
                onClick={() => handleChange(head)}
                title={describeLocationHead(head)}
              >
                <div className='inline-flex items-center gap-3'>
                  <LocationIcon value={head} size='1rem' />
                  {labelLocationHead(head)}
                </div>
              </DropdownButton>
            );
          })}
      </Dropdown>
    </div>
  );
}
