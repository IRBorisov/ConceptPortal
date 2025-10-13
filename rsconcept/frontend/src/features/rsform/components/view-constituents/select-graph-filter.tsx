'use client';

import { SelectorButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { prefixes } from '@/utils/constants';

import { describeCstSource, labelCstSource } from '../../labels';
import { DependencyMode } from '../../stores/cst-search';
import { IconDependencyMode } from '../icon-dependency-mode';

interface SelectGraphFilterProps extends Styling {
  value: DependencyMode;
  onChange: (value: DependencyMode) => void;
  dense?: boolean;
}

export function SelectGraphFilter({ value, dense, className, onChange, ...restProps }: SelectGraphFilterProps) {
  const {
    elementRef: menuRef,
    isOpen: isMenuOpen,
    toggle: toggleMenu,
    handleBlur: handleMenuBlur,
    hide: hideMenu
  } = useDropdown();

  function handleChange(newValue: DependencyMode) {
    hideMenu();
    onChange(newValue);
  }

  return (
    <div ref={menuRef} onBlur={handleMenuBlur} className={cn('relative', className)} {...restProps}>
      <SelectorButton
        tabIndex={-1}
        titleHtml='Настройка фильтрации <br/>по графу термов'
        hideTitle={isMenuOpen}
        className='h-full pr-2'
        icon={<IconDependencyMode value={value} size='1rem' />}
        text={!dense ? labelCstSource(value) : undefined}
        onClick={toggleMenu}
      />
      <Dropdown stretchLeft isOpen={isMenuOpen} margin='mt-3'>
        {Object.values(DependencyMode).map((value, index) => {
          const source = value as DependencyMode;
          return (
            <DropdownButton
              key={`${prefixes.cst_source_list}${index}`}
              className={!dense ? 'w-72' : undefined}
              title={dense ? labelCstSource(source) : undefined}
              icon={<IconDependencyMode value={source} size='1rem' />}
              onClick={() => handleChange(source)}
            >
              {!dense ? (
                <span>
                  <b>{labelCstSource(source)}:</b> {describeCstSource(source)}
                </span>
              ) : null}
            </DropdownButton>
          );
        })}
      </Dropdown>
    </div>
  );
}
