'use client';

import { SelectorButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { prefixes } from '@/utils/constants';

import { describeLocationHead, labelLocationHead } from '../labels';
import { LocationHead } from '../models/library';

import { IconLocationHead } from './icon-location-head';

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
  const { elementRef, handleBlur, isOpen, toggle, hide } = useDropdown();

  function handleChange(newValue: LocationHead) {
    hide();
    onChange(newValue);
  }

  return (
    <div
      ref={elementRef} //
      onBlur={handleBlur}
      className={cn('text-right relative', className)}
      {...restProps}
    >
      <SelectorButton
        tabIndex={-1}
        title={describeLocationHead(value)}
        hideTitle={isOpen}
        className='h-full'
        icon={<IconLocationHead value={value} size='1rem' />}
        text={labelLocationHead(value)}
        onClick={toggle}
      />

      <Dropdown isOpen={isOpen} stretchLeft margin='mt-2'>
        {Object.values(LocationHead)
          .filter(head => !excluded.includes(head))
          .map((head, index) => {
            return (
              <DropdownButton
                key={`${prefixes.location_head_list}${index}`}
                text={labelLocationHead(head)}
                title={describeLocationHead(head)}
                onClick={() => handleChange(head)}
                icon={<IconLocationHead value={head} size='1rem' />}
              />
            );
          })}
      </Dropdown>
    </div>
  );
}
