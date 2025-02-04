'use client';

import { PolicyIcon } from '@/components/DomainIcons';
import { CProps } from '@/components/props';
import Dropdown from '@/components/ui/Dropdown';
import DropdownButton from '@/components/ui/DropdownButton';
import MiniButton from '@/components/ui/MiniButton';
import useDropdown from '@/hooks/useDropdown';
import { AccessPolicy } from '@/models/library';
import { prefixes } from '@/utils/constants';
import { describeAccessPolicy, labelAccessPolicy } from '@/utils/labels';

interface SelectAccessPolicyProps extends CProps.Styling {
  value: AccessPolicy;
  onChange: (value: AccessPolicy) => void;

  disabled?: boolean;
  stretchLeft?: boolean;
}

function SelectAccessPolicy({ value, disabled, stretchLeft, onChange, ...restProps }: SelectAccessPolicyProps) {
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

export default SelectAccessPolicy;
