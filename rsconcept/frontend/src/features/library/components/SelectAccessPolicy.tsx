'use client';

import { MiniButton } from '@/components/Control';
import { type DomIconProps } from '@/components/DomainIcons';
import { Dropdown, DropdownButton, useDropdown } from '@/components/Dropdown';
import { IconPrivate, IconProtected, IconPublic } from '@/components/Icons';
import { type Styling } from '@/components/props';
import { prefixes } from '@/utils/constants';

import { AccessPolicy } from '../backend/types';
import { describeAccessPolicy, labelAccessPolicy } from '../labels';

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

/** Icon for access policy. */
function PolicyIcon({ value, size = '1.25rem', className }: DomIconProps<AccessPolicy>) {
  switch (value) {
    case AccessPolicy.PRIVATE:
      return <IconPrivate size={size} className={className ?? 'text-warn-600'} />;
    case AccessPolicy.PROTECTED:
      return <IconProtected size={size} className={className ?? 'text-sec-600'} />;
    case AccessPolicy.PUBLIC:
      return <IconPublic size={size} className={className ?? 'text-ok-600'} />;
  }
}
