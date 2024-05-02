'use client';

import { useCallback } from 'react';

import { IconFilter, IconFollow, IconImmutable, IconOwner, IconPublic } from '@/components/Icons';
import Dropdown from '@/components/ui/Dropdown';
import SelectorButton from '@/components/ui/SelectorButton';
import { useAuth } from '@/context/AuthContext';
import useDropdown from '@/hooks/useDropdown';
import useWindowSize from '@/hooks/useWindowSize';
import { LibraryFilterStrategy } from '@/models/miscellaneous';
import { prefixes } from '@/utils/constants';
import { describeLibraryFilter, labelLibraryFilter } from '@/utils/labels';

import DropdownButton from '../ui/DropdownButton';

function StrategyIcon(strategy: LibraryFilterStrategy, size: string, color?: string) {
  switch (strategy) {
    case LibraryFilterStrategy.MANUAL:
      return <IconFilter size={size} className={color} />;
    case LibraryFilterStrategy.CANONICAL:
      return <IconImmutable size={size} className={color} />;
    case LibraryFilterStrategy.COMMON:
      return <IconPublic size={size} className={color} />;
    case LibraryFilterStrategy.OWNED:
      return <IconOwner size={size} className={color} />;
    case LibraryFilterStrategy.SUBSCRIBE:
      return <IconFollow size={size} className={color} />;
  }
}

interface SelectFilterStrategyProps {
  value: LibraryFilterStrategy;
  onChange: (value: LibraryFilterStrategy) => void;
}

function SelectFilterStrategy({ value, onChange }: SelectFilterStrategyProps) {
  const menu = useDropdown();
  const { user } = useAuth();
  const size = useWindowSize();

  const handleChange = useCallback(
    (newValue: LibraryFilterStrategy) => {
      menu.hide();
      onChange(newValue);
    },
    [menu, onChange]
  );

  function isStrategyDisabled(strategy: LibraryFilterStrategy): boolean {
    if (strategy === LibraryFilterStrategy.SUBSCRIBE || strategy === LibraryFilterStrategy.OWNED) {
      return !user;
    } else {
      return false;
    }
  }

  return (
    <div ref={menu.ref} className='h-full text-right'>
      <SelectorButton
        transparent
        tabIndex={-1}
        title={describeLibraryFilter(value)}
        hideTitle={menu.isOpen}
        className='h-full'
        icon={StrategyIcon(value, '1rem', value !== LibraryFilterStrategy.MANUAL ? 'icon-primary' : '')}
        text={size.isSmall ? undefined : labelLibraryFilter(value)}
        onClick={menu.toggle}
      />
      <Dropdown isOpen={menu.isOpen}>
        {Object.values(LibraryFilterStrategy).map((enumValue, index) => {
          const strategy = enumValue as LibraryFilterStrategy;
          return (
            <DropdownButton
              className='w-[10rem]'
              key={`${prefixes.library_filters_list}${index}`}
              onClick={() => handleChange(strategy)}
              title={describeLibraryFilter(strategy)}
              disabled={isStrategyDisabled(strategy)}
            >
              <div className='inline-flex items-center gap-3'>
                {StrategyIcon(strategy, '1rem')}
                {labelLibraryFilter(strategy)}
              </div>
            </DropdownButton>
          );
        })}
      </Dropdown>
    </div>
  );
}

export default SelectFilterStrategy;
