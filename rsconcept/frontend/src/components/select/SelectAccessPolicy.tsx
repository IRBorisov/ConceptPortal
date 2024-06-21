'use client';

import { useCallback } from 'react';

import Dropdown from '@/components/ui/Dropdown';
import useDropdown from '@/hooks/useDropdown';
import { AccessPolicy } from '@/models/library';
import { prefixes } from '@/utils/constants';
import { describeAccessPolicy, labelAccessPolicy } from '@/utils/labels';

import { PolicyIcon } from '../DomainIcons';
import DropdownButton from '../ui/DropdownButton';
import MiniButton from '../ui/MiniButton';

interface SelectAccessPolicyProps {
  value: AccessPolicy;
  onChange: (value: AccessPolicy) => void;
  disabled?: boolean;
  stretchLeft?: boolean;
}

function SelectAccessPolicy({ value, disabled, stretchLeft, onChange }: SelectAccessPolicyProps) {
  const menu = useDropdown();

  const handleChange = useCallback(
    (newValue: AccessPolicy) => {
      menu.hide();
      if (newValue !== value) {
        onChange(newValue);
      }
    },
    [menu, value, onChange]
  );

  return (
    <div ref={menu.ref}>
      <MiniButton
        title={`Доступ: ${labelAccessPolicy(value)}`}
        hideTitle={menu.isOpen}
        className='h-full'
        icon={<PolicyIcon value={value} size='1.25rem' />}
        onClick={menu.toggle}
        disabled={disabled}
      />
      <Dropdown isOpen={menu.isOpen} stretchLeft={stretchLeft}>
        {Object.values(AccessPolicy).map((item, index) => (
          <DropdownButton
            key={`${prefixes.policy_list}${index}`}
            text={labelAccessPolicy(item)}
            title={describeAccessPolicy(item)}
            icon={<PolicyIcon value={item} size='1rem' />}
            onClick={() => handleChange(item)}
          />
        ))}
      </Dropdown>
    </div>
  );
}

export default SelectAccessPolicy;
