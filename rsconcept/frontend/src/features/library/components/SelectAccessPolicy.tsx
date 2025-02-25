'use client';

import { MiniButton } from '@/components/Control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/Dropdown';
import { type Styling } from '@/components/props';
import { prefixes } from '@/utils/constants';

import { AccessPolicy } from '../backend/types';
import { describeAccessPolicy, labelAccessPolicy } from '../labels';

import { IconAccessPolicy } from './IconAccessPolicy';

interface SelectAccessPolicyProps extends Styling {
  value: AccessPolicy;
  onChange: (value: AccessPolicy) => void;

  disabled?: boolean;
  stretchLeft?: boolean;
}

export function SelectAccessPolicy({ value, disabled, stretchLeft, onChange, ...restProps }: SelectAccessPolicyProps) {
  const menu = useDropdown();

  function handleChange(newValue: AccessPolicy) {
    menu.hide();
    if (newValue !== value) {
      onChange(newValue);
    }
  }

  return (
    <div ref={menu.ref} {...restProps}>
      <MiniButton
        title={`Доступ: ${labelAccessPolicy(value)}`}
        hideTitle={menu.isOpen}
        className='h-full'
        icon={<IconAccessPolicy value={value} size='1.25rem' />}
        onClick={menu.toggle}
        disabled={disabled}
      />
      <Dropdown isOpen={menu.isOpen} stretchLeft={stretchLeft}>
        {Object.values(AccessPolicy).map((item, index) => (
          <DropdownButton
            key={`${prefixes.policy_list}${index}`}
            text={labelAccessPolicy(item)}
            title={describeAccessPolicy(item)}
            icon={<IconAccessPolicy value={item} size='1rem' />}
            onClick={() => handleChange(item)}
          />
        ))}
      </Dropdown>
    </div>
  );
}
