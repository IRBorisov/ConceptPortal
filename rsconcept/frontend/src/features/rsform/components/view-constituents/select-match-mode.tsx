'use client';

import { SelectorButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { prefixes } from '@/utils/constants';

import { describeCstMatchMode, labelCstMatchMode } from '../../labels';
import { CstMatchMode } from '../../stores/cst-search';
import { IconCstMatchMode } from '../icon-cst-match-mode';

interface SelectMatchModeProps extends Styling {
  value: CstMatchMode;
  onChange: (value: CstMatchMode) => void;
  dense?: boolean;
}

export function SelectMatchMode({ value, dense, className, onChange, ...restProps }: SelectMatchModeProps) {
  const {
    elementRef: menuRef,
    isOpen: isMenuOpen,
    toggle: toggleMenu,
    handleBlur: handleMenuBlur,
    hide: hideMenu
  } = useDropdown();

  function handleChange(newValue: CstMatchMode) {
    hideMenu();
    onChange(newValue);
  }

  return (
    <div ref={menuRef} onBlur={handleMenuBlur} className={cn('relative', className)} {...restProps}>
      <SelectorButton
        titleHtml='Настройка фильтрации <br/>по проверяемым атрибутам'
        hideTitle={isMenuOpen}
        className='h-full pr-2'
        icon={<IconCstMatchMode value={value} size='1rem' />}
        text={!dense ? labelCstMatchMode(value) : undefined}
        onClick={toggleMenu}
      />
      <Dropdown stretchLeft isOpen={isMenuOpen} margin='mt-3'>
        {Object.values(CstMatchMode).map((value, index) => {
          const matchMode = value as CstMatchMode;
          return (
            <DropdownButton
              key={`${prefixes.cst_source_list}${index}`}
              className={!dense ? 'w-80' : undefined}
              title={dense ? labelCstMatchMode(matchMode) : undefined}
              icon={<IconCstMatchMode value={matchMode} size='1rem' />}
              onClick={() => handleChange(matchMode)}
            >
              {!dense ? (
                <span>
                  <b>{labelCstMatchMode(matchMode)}:</b> {describeCstMatchMode(matchMode)}
                </span>
              ) : null}
            </DropdownButton>
          );
        })}
      </Dropdown>
    </div>
  );
}
