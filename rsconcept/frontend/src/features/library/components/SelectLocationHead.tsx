'use client';

import clsx from 'clsx';

import { SelectorButton } from '@/components/Control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/Dropdown';
import { type Styling } from '@/components/props';
import { prefixes } from '@/utils/constants';

import { describeLocationHead, labelLocationHead } from '../labels';
import { LocationHead } from '../models/library';

import { IconLocationHead } from './IconLocationHead';

interface SelectLocationHeadProps extends Styling {
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
    <div ref={menu.ref} className={clsx('h-full text-right relative', className)} {...restProps}>
      <SelectorButton
        transparent
        tabIndex={-1}
        title={describeLocationHead(value)}
        hideTitle={menu.isOpen}
        className='h-full'
        icon={<IconLocationHead value={value} size='1rem' />}
        text={labelLocationHead(value)}
        onClick={menu.toggle}
      />

      <Dropdown isOpen={menu.isOpen} margin='mt-2'>
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
                  <IconLocationHead value={head} size='1rem' />
                  {labelLocationHead(head)}
                </div>
              </DropdownButton>
            );
          })}
      </Dropdown>
    </div>
  );
}
